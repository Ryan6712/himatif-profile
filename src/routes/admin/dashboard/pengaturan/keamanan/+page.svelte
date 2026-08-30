<script lang="ts">
	import { Toast } from '$lib/components/admin';
	import { ShieldCheck, Mail, ArrowRight, Loader2, KeyRound } from '@lucide/svelte';

	let { data } = $props();
	let profile = $derived(data.profile);

	// State Langkah/Step OTP
	let step = $state<'SELECT_EMAIL' | 'INPUT_OTP'>('SELECT_EMAIL');

	let isRequestingOtp = $state(false);
	let isVerifyingOtp = $state(false);

	// Input States
	let targetEmailType = $state<'utama' | 'cadangan'>('utama');
	let otpCode = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	// Message / Toast States
	let showToast = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error' | 'info'>('success');

	// Masking helper
	function maskEmail(email: string | null) {
		if (!email) return 'Belum diatur';
		const [name, domain] = email.split('@');
		return `${name.substring(0, 3)}***@${domain}`;
	}

	// 1. Aksi Request OTP
	async function requestOtp(e: SubmitEvent) {
		e.preventDefault();

		if (targetEmailType === 'cadangan' && !profile.backupEmail) {
			toastMessage = 'Anda belum mengatur email cadangan. Silakan pilih Email Utama.';
			toastType = 'error';
			showToast = true;
			return;
		}

		isRequestingOtp = true;

		try {
			const res = await fetch('/api/auth/otp-request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetType: targetEmailType })
			});

			const result = await res.json();

			if (result.success) {
				toastMessage = result.message;
				toastType = 'info';
				showToast = true;

				// Lanjut ke langkah selanjutnya
				step = 'INPUT_OTP';
			} else {
				toastMessage = result.message;
				toastType = 'error';
				showToast = true;
			}
		} catch (err) {
			toastMessage = 'Terjadi kegagalan jaringan saat mengirim kode.';
			toastType = 'error';
			showToast = true;
		} finally {
			isRequestingOtp = false;
		}
	}

	// 2. Aksi Verify OTP & Save Password
	async function submitNewPassword(e: SubmitEvent) {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			toastMessage = 'Konfirmasi kata sandi tidak cocok!';
			toastType = 'error';
			showToast = true;
			return;
		}

		if (newPassword.length < 8) {
			toastMessage = 'Kata sandi minimal harus 8 karakter.';
			toastType = 'error';
			showToast = true;
			return;
		}

		isVerifyingOtp = true;

		try {
			const res = await fetch('/api/auth/otp-verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					otpCode: otpCode,
					newPassword: newPassword
				})
			});

			const result = await res.json();

			if (result.success) {
				toastMessage = result.message;
				toastType = 'success';
				showToast = true;

				// Reset State Form Ke Awal
				step = 'SELECT_EMAIL';
				otpCode = '';
				newPassword = '';
				confirmPassword = '';
			} else {
				toastMessage = result.message;
				toastType = 'error';
				showToast = true;
			}
		} catch (err) {
			toastMessage = 'Terjadi kegagalan jaringan saat memvalidasi sandi.';
			toastType = 'error';
			showToast = true;
		} finally {
			isVerifyingOtp = false;
		}
	}
</script>

<Toast
	visible={showToast}
	message={toastMessage}
	type={toastType}
	onClose={() => (showToast = false)}
/>

<div class="stack-lg mx-auto mt-6 flex max-w-2xl flex-col">
	<div class="flex flex-col items-center gap-4 border-b border-primary/10 pb-6 text-center">
		<div
			class="flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/20 text-secondary shadow-inner"
		>
			<ShieldCheck class="h-8 w-8" />
		</div>
		<div>
			<h1 class="text-3xl font-extrabold tracking-tight text-title-text">Keamanan Akun</h1>
			<p class="mt-2 text-sm text-primary-text opacity-80">
				Kelola kata sandi administrator Anda dengan lapisan keamanan verifikasi email (OTP).
			</p>
		</div>
	</div>

	<!-- Container Form -->
	<div
		class="glass-card hover-lift mt-2 rounded p-6 shadow-sm md:p-8"
		style="box-shadow: var(--shadow-card-md);"
	>
		{#if step === 'SELECT_EMAIL'}
			<!-- STEP 1: PILIH EMAIL -->
			<form onsubmit={requestOtp} class="flex flex-col gap-6">
				<div>
					<h3 class="mb-1 text-lg font-bold text-title-text">Ganti Kata Sandi</h3>
					<p class="text-xs text-primary-text opacity-70">
						Pilih alamat email kemana sistem akan mengirim kode OTP (One Time Password) 6-digit
						untuk memverifikasi identitas Anda.
					</p>
				</div>

				<div class="flex flex-col gap-3">
					<!-- Opsi Utama -->
					<label
						class="smooth-transition flex cursor-pointer items-start gap-4 rounded border p-4
                        {targetEmailType === 'utama'
							? 'border-primary bg-primary/10'
							: 'border-primary/20 bg-background/50 hover:bg-primary/5'}"
					>
						<input
							type="radio"
							name="emailType"
							value="utama"
							bind:group={targetEmailType}
							class="mt-1 h-4 w-4 text-primary accent-primary focus:ring-primary"
						/>

						<div class="flex flex-col">
							<span class="flex items-center gap-2 text-sm font-bold">
								<Mail class="h-4 w-4 text-secondary opacity-70" /> Email Utama
							</span>
							<span class="mt-0.5 text-xs opacity-70">{maskEmail(profile.email)}</span>
						</div>
					</label>

					<!-- Opsi Cadangan -->
					<label
						class="smooth-transition relative flex cursor-pointer items-start gap-4 rounded border p-4
                        {targetEmailType === 'cadangan'
							? 'border-primary bg-primary/10'
							: 'border-primary/20 bg-background/50 hover:bg-primary/5'}
                        {!profile.backupEmail ? 'opacity-50 grayscale' : ''}"
					>
						<input
							type="radio"
							name="emailType"
							value="cadangan"
							bind:group={targetEmailType}
							disabled={!profile.backupEmail}
							class="mt-1 h-4 w-4 text-primary accent-primary focus:ring-primary"
						/>

						<div class="flex flex-col">
							<span class="flex items-center gap-2 text-sm font-bold">
								<ShieldCheck class="h-4 w-4 text-secondary opacity-70" /> Email Cadangan
							</span>
							<span class="mt-0.5 text-xs opacity-70">{maskEmail(profile.backupEmail)}</span>
						</div>

						{#if !profile.backupEmail}
							<span
								class="absolute top-4 right-4 rounded bg-slate-500/10 px-2 py-1 text-[10px] font-bold text-slate-500 uppercase"
								>Belum Diatur</span
							>
						{/if}
					</label>
				</div>

				<div class="mt-2 flex justify-end pt-4">
					<button
						type="submit"
						disabled={isRequestingOtp}
						class="btn-cta flex items-center gap-2 rounded-full px-8 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if isRequestingOtp}
							<Loader2 class="h-4 w-4 animate-spin" />
							<span>Mengirim Kode...</span>
						{:else}
							<span>Kirim Kode OTP</span>
							<ArrowRight class="h-4 w-4" />
						{/if}
					</button>
				</div>
			</form>
		{:else if step === 'INPUT_OTP'}
			<!-- STEP 2: MASUKAN KODE OTP DAN PASSWORD BARU -->
			<form onsubmit={submitNewPassword} class="flex flex-col gap-5">
				<div class="rounded border border-amber-500/20 bg-amber-500/10 p-4 text-center">
					<p class="text-sm font-semibold text-amber-700">
						Kode 6-digit telah dikirim ke email
						<strong class="text-amber-800"
							>{targetEmailType === 'utama'
								? maskEmail(profile.email)
								: maskEmail(profile.backupEmail)}</strong
						>. Kode ini akan hangus dalam 5 menit.
					</p>
				</div>

				<!-- Input OTP -->
				<div class="form-control mt-2 flex flex-col gap-2">
					<label for="otpCode" class="text-sm font-bold text-primary-text opacity-90"
						>Kode OTP <span class="text-red-500">*</span></label
					>
					<input
						type="text"
						id="otpCode"
						bind:value={otpCode}
						placeholder="Masukkan 6-digit kode di sini..."
						required
						maxlength="6"
						class="smooth-transition w-full rounded border border-primary/30 bg-background/80 px-4 py-3 text-center font-mono text-xl tracking-[0.5em] focus:ring-2 focus:ring-primary/50 focus:outline-none"
					/>
				</div>

				<div class="my-2 h-px w-full bg-primary/10"></div>

				<!-- Input New Password -->
				<div class="form-control flex flex-col gap-2">
					<label for="newPassword" class="text-sm font-bold text-primary-text opacity-90"
						>Kata Sandi Baru <span class="text-red-500">*</span></label
					>
					<input
						type="password"
						id="newPassword"
						bind:value={newPassword}
						placeholder="Minimal 8 karakter..."
						required
						minlength="8"
						class="smooth-transition w-full rounded border border-primary/20 bg-background/80 px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none"
					/>
				</div>

				<!-- Confirm Password -->
				<div class="form-control flex flex-col gap-2">
					<label for="confirmPassword" class="text-sm font-bold text-primary-text opacity-90"
						>Ulangi Kata Sandi <span class="text-red-500">*</span></label
					>
					<input
						type="password"
						id="confirmPassword"
						bind:value={confirmPassword}
						placeholder="Pastikan sama dengan sandi di atas..."
						required
						minlength="8"
						class="smooth-transition w-full rounded border border-primary/20 bg-background/80 px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:outline-none
                        {confirmPassword && confirmPassword !== newPassword
							? 'border-red-500 bg-red-50'
							: ''}"
					/>
					{#if confirmPassword && confirmPassword !== newPassword}
						<span class="text-xs font-semibold text-red-500">Kata sandi tidak cocok.</span>
					{/if}
				</div>

				<!-- Actions -->
				<div class="mt-2 flex items-center justify-between pt-4">
					<button
						type="button"
						onclick={() => (step = 'SELECT_EMAIL')}
						class="smooth-transition text-sm font-bold text-secondary opacity-80 hover:underline hover:opacity-100"
					>
						&larr; Ganti Email Tujuan
					</button>

					<button
						type="submit"
						disabled={isVerifyingOtp ||
							!otpCode ||
							newPassword.length < 8 ||
							newPassword !== confirmPassword}
						class="btn-cta flex items-center gap-2 rounded-full px-8 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if isVerifyingOtp}
							<Loader2 class="h-4 w-4 animate-spin" />
							<span>Memvalidasi...</span>
						{:else}
							<KeyRound class="h-4 w-4" />
							<span>Simpan Sandi Baru</span>
						{/if}
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
