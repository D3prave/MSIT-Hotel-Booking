


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


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "supabase_admin";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "room_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "status" "text" DEFAULT 'confirmed'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "bookings_date_range" CHECK (("end_date" > "start_date")),
    CONSTRAINT "bookings_status_check" CHECK (("status" = ANY (ARRAY['confirmed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."bookings" OWNER TO "supabase_admin";


CREATE TABLE IF NOT EXISTS "public"."rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "price_cents" integer NOT NULL,
    "is_available" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "rooms_price_cents_check" CHECK (("price_cents" >= 0))
);


ALTER TABLE "public"."rooms" OWNER TO "supabase_admin";


ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rooms"
    ADD CONSTRAINT "rooms_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_bookings_room_dates" ON "public"."bookings" USING "btree" ("room_id", "start_date", "end_date");



CREATE INDEX "idx_bookings_user_id" ON "public"."bookings" USING "btree" ("user_id");



CREATE INDEX "idx_rooms_available" ON "public"."rooms" USING "btree" ("is_available");



CREATE OR REPLACE TRIGGER "trg_bookings_updated_at" BEFORE UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_rooms_updated_at" BEFORE UPDATE ON "public"."rooms" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Rooms are readable by everyone" ON "public"."rooms" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Users can create own bookings" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own bookings" ON "public"."bookings" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own bookings" ON "public"."bookings" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own bookings" ON "public"."bookings" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rooms" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "postgres";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."bookings" TO "postgres";
GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."rooms" TO "postgres";
GRANT ALL ON TABLE "public"."rooms" TO "anon";
GRANT ALL ON TABLE "public"."rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."rooms" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































