--
-- PostgreSQL database dump
--

\restrict PNJrbmXGdejMmQUUSCuV9fZQpyrYnl9ZBRcdus3c9cBdeDh6FdJdcLSVvnPJPDE

-- Dumped from database version 15.17 (Homebrew)
-- Dumped by pg_dump version 15.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: exercises; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercises (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    muscle_group character varying(50) NOT NULL
);


--
-- Name: exercises_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exercises_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exercises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exercises_id_seq OWNED BY public.exercises.id;


--
-- Name: foods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.foods (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    calories integer NOT NULL,
    protein numeric(6,2) DEFAULT 0,
    carbs numeric(6,2) DEFAULT 0,
    fat numeric(6,2) DEFAULT 0,
    calories_per_100g numeric(8,2),
    protein_per_100g numeric(8,2),
    carbs_per_100g numeric(8,2),
    fat_per_100g numeric(8,2),
    food_state character varying(20) DEFAULT 'raw'::character varying
);


--
-- Name: foods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.foods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: foods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.foods_id_seq OWNED BY public.foods.id;


--
-- Name: meals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meals (
    id integer NOT NULL,
    user_id integer NOT NULL,
    food_id integer NOT NULL,
    meal_type character varying(20) NOT NULL,
    quantity numeric(8,2) NOT NULL,
    eaten_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    quantity_g numeric(8,2)
);


--
-- Name: meals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meals_id_seq OWNED BY public.meals.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    age integer,
    height_cm numeric(5,2),
    current_weight_kg numeric(6,2),
    goal_weight_kg numeric(6,2),
    calorie_target integer,
    protein_target_g numeric(6,2)
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workouts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    exercise_id integer NOT NULL,
    sets integer NOT NULL,
    reps integer NOT NULL,
    weight numeric(6,2) NOT NULL,
    performed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: workouts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workouts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workouts_id_seq OWNED BY public.workouts.id;


--
-- Name: exercises id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises ALTER COLUMN id SET DEFAULT nextval('public.exercises_id_seq'::regclass);


--
-- Name: foods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foods ALTER COLUMN id SET DEFAULT nextval('public.foods_id_seq'::regclass);


--
-- Name: meals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meals ALTER COLUMN id SET DEFAULT nextval('public.meals_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workouts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workouts ALTER COLUMN id SET DEFAULT nextval('public.workouts_id_seq'::regclass);


--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (id);


--
-- Name: foods foods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_pkey PRIMARY KEY (id);


--
-- Name: meals meals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workouts workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_pkey PRIMARY KEY (id);


--
-- Name: meals meals_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id);


--
-- Name: meals meals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workouts workouts_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id);


--
-- Name: workouts workouts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PNJrbmXGdejMmQUUSCuV9fZQpyrYnl9ZBRcdus3c9cBdeDh6FdJdcLSVvnPJPDE

