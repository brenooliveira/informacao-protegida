begin;
select plan(2);
select is((select count(*)::integer from pg_tables where schemaname = 'public' and not rowsecurity), 0, 'Toda tabela public tem RLS habilitado');
select is((select count(*)::integer from pg_tables t where t.schemaname = 'public' and not exists (select 1 from pg_policies p where p.schemaname=t.schemaname and p.tablename=t.tablename)), 0, 'Toda tabela public tem política explícita (inclusive deny-all)');
select * from finish();
rollback;
