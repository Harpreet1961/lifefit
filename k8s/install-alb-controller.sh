
#!/usr/bin/env bash

set -Eeuo pipefail

# ==========================================
# 1. CONFIGURATION
# ==========================================

CLUSTER_NAME="${CLUSTER_NAME:-lifefit-eks-console}"
REGION="${REGION:-ap-south-1}"
CHART_VERSION="3.6.3"

POLICY_NAME="AWSLoadBalancerControllerIAMPolicy"
ROLE_NAME="AmazonEKSLoadBalancerControllerRole"
SERVICE_ACCOUNT="aws-load-balancer-controller"
NAMESPACE="kube-system"

echo "======================================"
echo " AWS Load Balancer Controller Setup"
echo "======================================"

# ==========================================
# 2. CHECK REQUIRED TOOLS
# ==========================================

for cmd in aws kubectl helm curl; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: $cmd is not installed"
    exit 1
  fi
done

# ==========================================
# 3. AWS ACCOUNT AND CLUSTER DETAILS
# ==========================================

ACCOUNT_ID=$(aws sts get-caller-identity \
  --query Account --output text)

CLUSTER_ARN=$(aws eks describe-cluster \
  --name "$CLUSTER_NAME" \
  --region "$REGION" \
  --query 'cluster.arn' \
  --output text)

CLUSTER_ACCOUNT=$(echo "$CLUSTER_ARN" | cut -d: -f5)

if [[ "$ACCOUNT_ID" != "$CLUSTER_ACCOUNT" ]]; then
  echo "ERROR: AWS account and EKS cluster account differ"
  exit 1
fi

VPC_ID=$(aws eks describe-cluster \
  --name "$CLUSTER_NAME" \
  --region "$REGION" \
  --query 'cluster.resourcesVpcConfig.vpcId' \
  --output text)

POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}"
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

echo "Account: $ACCOUNT_ID"
echo "Cluster: $CLUSTER_NAME"
echo "Region:  $REGION"
echo "VPC:     $VPC_ID"

# ==========================================
# 4. CHECK POD IDENTITY AGENT
# ==========================================

if ! kubectl get daemonset eks-pod-identity-agent \
  -n kube-system >/dev/null 2>&1; then
  echo "ERROR: EKS Pod Identity Agent not found"
  exit 1
fi

# ==========================================
# 5. DOWNLOAD IAM POLICY
# ==========================================

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

curl --fail --silent --show-error \
  -o "$TMP_DIR/iam_policy.json" \
  "https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v${CHART_VERSION}/docs/install/iam_policy.json"

echo "IAM policy downloaded."

# ==========================================
# 6. CREATE IAM POLICY IF MISSING
# ==========================================

if aws iam get-policy \
  --policy-arn "$POLICY_ARN" >/dev/null 2>&1; then

  echo "IAM policy already exists. Reusing it."

else

  aws iam create-policy \
    --policy-name "$POLICY_NAME" \
    --policy-document "file://$TMP_DIR/iam_policy.json"

  echo "IAM policy created."

fi

# ==========================================
# 7. CREATE IAM ROLE IF MISSING
# ==========================================

if aws iam get-role \
  --role-name "$ROLE_NAME" >/dev/null 2>&1; then

  echo "IAM role already exists. Reusing it."

else

  cat > "$TMP_DIR/trust-policy.json" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "pods.eks.amazonaws.com"
      },
      "Action": [
        "sts:AssumeRole",
        "sts:TagSession"
      ],
      "Condition": {
        "StringEquals": {
          "aws:RequestTag/kubernetes-namespace": "$NAMESPACE",
          "aws:RequestTag/kubernetes-service-account": "$SERVICE_ACCOUNT"
        }
      }
    }
  ]
}
EOF

  aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document \
    "file://$TMP_DIR/trust-policy.json"

  echo "IAM role created."

fi

# ==========================================
# 8. ATTACH IAM POLICY TO ROLE
# ==========================================

aws iam attach-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-arn "$POLICY_ARN"

echo "IAM policy attached to role."

# Allow IAM changes to propagate
sleep 10

# ==========================================
# 9. CREATE KUBERNETES SERVICEACCOUNT
# ==========================================

if kubectl get serviceaccount "$SERVICE_ACCOUNT" \
  -n "$NAMESPACE" >/dev/null 2>&1; then

  echo "ServiceAccount already exists."

else

  kubectl create serviceaccount "$SERVICE_ACCOUNT" \
    -n "$NAMESPACE"

fi

# ==========================================
# 10. CREATE OR UPDATE POD IDENTITY
# ==========================================

ASSOCIATION_ID=$(aws eks list-pod-identity-associations \
  --cluster-name "$CLUSTER_NAME" \
  --region "$REGION" \
  --query "associations[?namespace=='$NAMESPACE' && serviceAccount=='$SERVICE_ACCOUNT'].associationId | [0]" \
  --output text)

if [[ "$ASSOCIATION_ID" == "None" || -z "$ASSOCIATION_ID" ]]; then

  aws eks create-pod-identity-association \
    --cluster-name "$CLUSTER_NAME" \
    --namespace "$NAMESPACE" \
    --service-account "$SERVICE_ACCOUNT" \
    --role-arn "$ROLE_ARN" \
    --region "$REGION"

  echo "Pod Identity association created."

else

  CURRENT_ROLE=$(aws eks describe-pod-identity-association \
    --cluster-name "$CLUSTER_NAME" \
    --association-id "$ASSOCIATION_ID" \
    --region "$REGION" \
    --query 'association.roleArn' \
    --output text)

  if [[ "$CURRENT_ROLE" != "$ROLE_ARN" ]]; then

    aws eks update-pod-identity-association \
      --cluster-name "$CLUSTER_NAME" \
      --association-id "$ASSOCIATION_ID" \
      --role-arn "$ROLE_ARN" \
      --region "$REGION"

    echo "Pod Identity association updated."

  else

    echo "Pod Identity association already correct."

  fi

fi

# ==========================================
# 11. ADD HELM REPOSITORY
# ==========================================

helm repo add eks https://aws.github.io/eks-charts \
  --force-update

helm repo update eks

# ==========================================
# 12. INSTALL OR UPGRADE CONTROLLER
# ==========================================

helm upgrade --install aws-load-balancer-controller \
  eks/aws-load-balancer-controller \
  --namespace "$NAMESPACE" \
  --version "$CHART_VERSION" \
  --set clusterName="$CLUSTER_NAME" \
  --set region="$REGION" \
  --set vpcId="$VPC_ID" \
  --set serviceAccount.create=false \
  --set serviceAccount.name="$SERVICE_ACCOUNT" \
  --wait \
  --timeout 10m

# ==========================================
# 13. VERIFY INSTALLATION
# ==========================================

echo ""
echo "Waiting for controller deployment..."

kubectl rollout status deployment/aws-load-balancer-controller \
  -n "$NAMESPACE" \
  --timeout=300s

echo ""
echo "======================================"
echo " INSTALLATION COMPLETED"
echo "======================================"

kubectl get deployment \
  aws-load-balancer-controller \
  -n "$NAMESPACE"

kubectl get pods \
  -n "$NAMESPACE" \
  -l app.kubernetes.io/name=aws-load-balancer-controller

echo ""
echo "Helm release:"
helm list -n "$NAMESPACE"

