create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  rol_nombre text;
begin
  select r.nombre into rol_nombre
  from public.usuarios u
  join public.roles r on r.id = u."rolId"
  where u."authId" = (event->>'user_id');

  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(rol_nombre, 'CLIENTE')));
  event := jsonb_set(event, '{claims}', claims);

  return event;
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

grant select on public.usuarios, public.roles to supabase_auth_admin;
