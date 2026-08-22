create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rol_cliente_id text;
begin
  select id into rol_cliente_id from public.roles where nombre = 'CLIENTE';

  insert into public.usuarios (id, "authId", email, nombre, "rolId", "creadoEn", "actualizadoEn")
  values (
    gen_random_uuid()::text,
    new.id::text,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'nombre',
      split_part(new.email, '@', 1)
    ),
    rol_cliente_id,
    now(),
    now()
  )
  on conflict ("authId") do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
