--
-- PostgreSQL database dump
--

\restrict aecJvVlQQ6xWhWPgSmvrm6x2XaFaMFgEtuKA5XgV7TdWrFPCx55Lo1MAjivCsv8

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

--
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exercises (id, name, muscle_group) FROM stdin;
1	Bench Press	Chest
2	Lat Pulldown	Back
3	Chest Supported Row	Back
4	Shoulder Press	Shoulders
5	Bicep Curl	Biceps
6	Tricep Pushdown	Triceps
7	Squat	Legs
\.


--
-- Data for Name: foods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.foods (id, name, calories, protein, carbs, fat, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, food_state) FROM stdin;
1	Egg	70	6.30	0.40	4.80	143.00	12.60	0.70	9.50	raw
4	Dal	120	7.00	18.00	2.00	350.00	24.00	60.00	2.00	raw
5	Banana	105	1.30	27.00	0.40	89.00	1.10	22.80	0.30	raw
6	Whey Protein	120	24.00	3.00	2.00	400.00	80.00	8.00	6.00	raw
3	Rice	130	2.70	28.00	0.30	360.00	7.00	80.00	0.60	raw
2	Wheat Flour	100	3.00	20.00	1.50	340.00	12.00	72.00	2.00	raw
\.


--
-- Name: exercises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exercises_id_seq', 7, true);


--
-- Name: foods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.foods_id_seq', 6, true);


--
-- PostgreSQL database dump complete
--

\unrestrict aecJvVlQQ6xWhWPgSmvrm6x2XaFaMFgEtuKA5XgV7TdWrFPCx55Lo1MAjivCsv8

