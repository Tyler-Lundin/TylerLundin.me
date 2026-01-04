-- Helper RPC: execute arbitrary SELECT and return JSON array
-- WARNING: This is meant for admin/service_role usage from server code only.
create or replace function public.execute_sql(sql_query text)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  -- Only allow SELECT statements as a basic safeguard
  if position('select' in lower(sql_query)) != 1 then
    raise exception 'Only SELECT statements are allowed';
  end if;

  execute format('select coalesce(json_agg(t), ''[]''::json) from (%s) t', sql_query) into result;
  return coalesce(result, '[]'::json);
end;
$$;

revoke all on function public.execute_sql(text) from public;
grant execute on function public.execute_sql(text) to authenticated;
grant execute on function public.execute_sql(text) to service_role;

