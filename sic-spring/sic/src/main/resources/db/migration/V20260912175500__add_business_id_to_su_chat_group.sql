-- V20260912175500__add_business_id_to_su_chat_group.sql
-- Add business_id column to su_chat_group table

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'su_chat_group'
          AND column_name = 'business_id'
    ) THEN
        ALTER TABLE public.su_chat_group ADD COLUMN business_id UUID;

        -- Backfill business_id from group members if available
        UPDATE public.su_chat_group scg
        SET business_id = (
            SELECT scgm.business_id
            FROM public.su_chat_group_member scgm
            WHERE scgm.group_id = scg.id
            LIMIT 1
        )
        WHERE scg.business_id IS NULL;

        -- Fallback if any remain null: use first active business
        UPDATE public.su_chat_group scg
        SET business_id = (
            SELECT id FROM public.su_business WHERE is_delete = false ORDER BY created_date ASC LIMIT 1
        )
        WHERE scg.business_id IS NULL;
    END IF;
END $$;
