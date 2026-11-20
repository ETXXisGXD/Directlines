-- 005_staff_role.sql
-- Add the staff role in its own transaction.

alter type public.user_role add value if not exists 'staff';

