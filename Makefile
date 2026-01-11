.PHONY: supabase-start supabase-stop supabase-reset supabase-status

supabase-start:
	supabase start

supabase-stop:
	supabase stop

supabase-reset:
	supabase db reset --use-migra --linked

supabase-status:
	supabase status

# Docker helpers
docker-build:
	docker build \
		--build-arg NEXT_PUBLIC_SUPABASE_URL=$$(grep NEXT_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2) \
		--build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env | cut -d '=' -f2) \
		-t tylerlundin-me .

docker-run:
	docker run -p 3000:3000 --env-file .env tylerlundin-me

