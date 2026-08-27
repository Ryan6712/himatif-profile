<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormField, Toast } from '$lib/components/admin';
	import { UserCheck, KeyRound, Save, ShieldCheck } from '@lucide/svelte';

	let { data, form } = $props();

	let currentUser = $derived(data.user);

	let isSubmittingProfile = $state(false);
	let isSubmittingPassword = $state(false);

	let showToast = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');

	$effect(() => {
		if (form?.success) {
			toastMessage = form.message || 'Perubahan berhasil disimpan!';
			toastType = 'success';
			showToast = true;
		} else if (form?.error) {
			toastMessage = form.error;
			toastType = 'error';
			showToast = true;
		}
	});
</script>

<Toast
	visible={showToast}
	message={toastMessage}
	type={toastType}
	onClose={() => (showToast = false)}
/>

<div class="stack-lg mx-auto flex max-w-4xl flex-col">
	<div class="flex flex-col gap-1 border-b border-primary/10 pb-4">
		<h1 class="text-3xl font-extrabold tracking-tight text-title-text">
			Pengaturan <span class="gradient-text">Akun Admin</span>
		</h1>
		<p class="text-sm text-primary-text opacity-80">
			Kelola identitas profil administrator dan ubah kata sandi akun Anda.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
		<!-- Card 1: Ganti Informasi Akun / Username -->
		<div
			class="glass-card hover-lift rounded p-6 shadow-sm"
			style="box-shadow: var(--shadow-card-md);"
		>
			<div class="mb-6 flex items-center gap-3 border-b border-primary/10 pb-4">
				<div class="icon-container flex h-10 w-10 items-center justify-center rounded">
					<UserCheck class="h-5 w-5 text-secondary" />
				</div>
				<div>
					<h2 class="text-lg font-bold text-title-text">Profil Administrator</h2>
					<p class="text-xs text-primary-text opacity-70">Ubah nama, username, atau email admin.</p>
				</div>
			</div>

			<form
				method="POST"
				action="?/updateProfile"
				class="flex flex-col gap-4"
				use:enhance={() => {
					isSubmittingProfile = true;
					showToast = false;
					return async ({ update }) => {
						await update({ reset: false });
						isSubmittingProfile = false;
					};
				}}
			>
				<FormField
					label="Nama Lengkap"
					name="name"
					value={form?.profileValues?.name ?? currentUser?.name ?? ''}
					required
					error={form?.profileErrors?.name}
					placeholder="Admin HIMATIF"
				/>

				<FormField
					label="Username"
					name="username"
					value={form?.profileValues?.username ?? currentUser?.username ?? ''}
					required
					error={form?.profileErrors?.username}
					placeholder="admin"
				/>

				<FormField
					type="email"
					label="Alamat Email"
					name="email"
					value={form?.profileValues?.email ?? currentUser?.email ?? ''}
					required
					error={form?.profileErrors?.email}
					placeholder="admin@himatif.ac.id"
				/>

				<div class="mt-2 flex justify-end">
					<button
						type="submit"
						disabled={isSubmittingProfile}
						class="btn-cta flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold disabled:opacity-50"
					>
						{#if isSubmittingProfile}
							<span
								class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
							></span>
							<span>Menyimpan...</span>
						{:else}
							<Save class="h-4 w-4" />
							<span>Simpan Profil</span>
						{/if}
					</button>
				</div>
			</form>
		</div>

		<!-- Card 2: Ganti Password -->
		<div
			class="glass-card hover-lift rounded p-6 shadow-sm"
			style="box-shadow: var(--shadow-card-md);"
		>
			<div class="mb-6 flex items-center gap-3 border-b border-primary/10 pb-4">
				<div class="icon-container flex h-10 w-10 items-center justify-center rounded">
					<KeyRound class="h-5 w-5 text-secondary" />
				</div>
				<div>
					<h2 class="text-lg font-bold text-title-text">Ubah Kata Sandi</h2>
					<p class="text-xs text-primary-text opacity-70">
						Gunakan kata sandi kuat minimal 6 karakter.
					</p>
				</div>
			</div>

			<form
				method="POST"
				action="?/updatePassword"
				class="flex flex-col gap-4"
				use:enhance={() => {
					isSubmittingPassword = true;
					showToast = false;
					return async ({ update }) => {
						await update({ reset: true });
						isSubmittingPassword = false;
					};
				}}
			>
				<FormField
					type="password"
					label="Password Saat Ini"
					name="currentPassword"
					required
					error={form?.passwordErrors?.currentPassword}
					placeholder="••••••••"
				/>

				<FormField
					type="password"
					label="Password Baru"
					name="newPassword"
					required
					error={form?.passwordErrors?.newPassword}
					placeholder="Minimal 6 karakter"
				/>

				<FormField
					type="password"
					label="Konfirmasi Password Baru"
					name="confirmPassword"
					required
					error={form?.passwordErrors?.confirmPassword}
					placeholder="Ulangi password baru"
				/>

				<div class="mt-2 flex justify-end">
					<button
						type="submit"
						disabled={isSubmittingPassword}
						class="btn-cta flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold disabled:opacity-50"
					>
						{#if isSubmittingPassword}
							<span
								class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
							></span>
							<span>Memproses...</span>
						{:else}
							<ShieldCheck class="h-4 w-4" />
							<span>Perbarui Password</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
