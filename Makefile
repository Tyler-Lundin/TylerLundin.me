.PHONY: supabase-start supabase-stop supabase-reset supabase-status

supabase-start:
	supabase start

supabase-stop:
	supabase stop

supabase-reset:
	supabase db reset --use-migra --linked

supabase-status:
	supabase status

