<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/authClient';
	import { resolve } from '$app/paths';
	import { LogIn, Loader2 } from '@lucide/svelte'; //pakai @lucide/svelte bukan lucide-svelte kita pakai versi terbaru

	let rawInput: string = $state('');
	let usernameValue: string = $state('');
	let emailValue: string = $state('');
	let passwordValue: string = $state('');

	$effect(() => {
		if (!rawInput) {
			emailValue = '';
			usernameValue = '';
			return;
		}

		if (rawInput.includes('@')) {
			emailValue = rawInput;
			usernameValue = '';
		} else {
			usernameValue = rawInput;
			emailValue = '';
		}
	});

	let isLoading = $state(false);
	let errorMessage = $state('');

	const handleLogin = async (e: SubmitEvent) => {
		e.preventDefault();
		isLoading = true;
		errorMessage = ''; // reset error

		try {
			if (emailValue) {
				await authClient.signIn.email(
					{
						email: emailValue,
						password: passwordValue
					},
					{
						onSuccess: (): void => {
							goto(resolve('/admin/dashboard'));
						},
						onError: (ctx) => {
							errorMessage = ctx.error.message;
						}
					}
				);
			} else {
				await authClient.signIn.username(
					{
						username: usernameValue,
						password: passwordValue
					},
					{
						onSuccess: (): void => {
							goto(resolve('/admin/dashboard'));
						},
						onError: (ctx) => {
							errorMessage = ctx.error.message;
						}
					}
				);
			}
		} finally {
			isLoading = false;
		}
	};
</script>

<div
	class="bg-gradient-surface relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4"
>
	<!-- Subtle dot pattern overlay -->
	<div class="bg-dot-pattern pointer-events-none absolute inset-0"></div>

	<!-- PENGGUNAAN UTILITY CLASS SESUAI DESIGN PATTERN -->
	<div
		class="glass-card group hover-lift relative z-10 flex w-full max-w-md flex-col gap-6 rounded p-8 md:p-10"
		style="box-shadow: var(--shadow-card-xl);"
	>
		<div class="header flex flex-col gap-2 text-center">
			<h1 class="text-3xl font-extrabold tracking-tight text-title-text">
				Admin <span class="gradient-text">Panel</span>
			</h1>
			<p class="text-sm text-primary-text opacity-70">Login untuk mengakses dashboard HIMATIF</p>
		</div>

		<form onsubmit={handleLogin} class="stack mt-2 flex flex-col">
			<div class="form-control flex flex-col gap-2">
				<label for="userInput" class="text-sm font-semibold text-primary-text opacity-90"
					>Email / Username</label
				>
				<!-- Menghilangkan styling border putih transparan, diganti yang lebih kalem -->
				<input
					type="text"
					id="userInput"
					name="userInput"
					bind:value={rawInput}
					placeholder="admin atau admin@himatif.ac.id"
					required
					class="smooth-transition rounded border border-primary/20 bg-background/80 px-4 py-3 text-title-text focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none"
				/>
			</div>

			<div class="form-control flex flex-col gap-2">
				<label for="password" class="text-sm font-semibold text-primary-text opacity-90"
					>Password</label
				>
				<input
					type="password"
					id="password"
					name="password"
					bind:value={passwordValue}
					placeholder="••••••••"
					required
					class="smooth-transition rounded border border-primary/20 bg-background/80 px-4 py-3 text-title-text focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none"
				/>
			</div>

			{#if errorMessage}
				<div class="mt-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
					{errorMessage}
				</div>
			{/if}

			<button
				type="submit"
				disabled={isLoading || !rawInput || !passwordValue}
				class="btn-cta mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if isLoading}
					<Loader2 class="h-5 w-5 animate-spin" />
					<span>Memproses...</span>
				{:else}
					<span>Masuk Dashboard</span>
					<LogIn class="h-5 w-5" />
				{/if}
			</button>
		</form>

		<div class="mt-2 text-center">
			<a
				href="/"
				class="smooth-transition text-sm font-semibold text-secondary opacity-80 hover:opacity-100"
				>&larr; Kembali ke Beranda</a
			>
		</div>
	</div>
</div>
