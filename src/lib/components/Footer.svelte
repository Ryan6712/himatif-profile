<script lang="ts">
	interface NavLink {
		name: string;
		path: string;
	}

	let { logoUrl } = $props();

	let navItems: NavLink[] = [
		{
			name: 'home',
			path: '/'
		},
		{
			name: 'member',
			path: '/member'
		},
		{
			name: 'program kerja',
			path: '/proker'
		},
		{
			name: 'devisi',
			path: '/devisi'
		}
	];
</script>

<footer class="relative overflow-hidden bg-surface pt-15 pb-10 text-primary-text">
	<!-- Gradient border top -->
	<div
		class="absolute top-0 right-0 left-0 h-0.75 bg-linear-to-r from-primary via-secondary to-tertiary"
	></div>

	<div class="container mx-auto px-6">
		<div class="mb-16 grid grid-cols-1 gap-8 md:grid-cols-4">
			<!-- Brand -->
			<div class="md:col-span-2">
				<!-- Logo 215x35 aspect ratio ~6:1 -->
				<img
					src={logoUrl}
					alt="HIMATIF Logo"
					width="215"
					height="35"
					loading="lazy"
					decoding="async"
					class="object-fit mb-3 h-[35px] w-[215px] object-contain"
				/>
				<p class="text-sm leading-relaxed opacity-75">
					Himpunan Mahasiswa Teknologi Informasi ITB Yadika adalah wadah bagi mahasiswa Teknologi
					Informasi untuk berkolaborasi, mengeksplorasi, dan mengembangkan diri dalam bidang
					teknologi informasi.
				</p>
			</div>

			<!-- Contact -->
			<div class="md:text-end">
				<h4 class="mb-4 text-lg font-semibold text-title-text">Kontak</h4>
				<ul class="stack-sm text-sm">
					<li class="opacity-80 transition-opacity hover:opacity-100">
						📍 Kampus ITB Yadika Bangil, Kec. Bangil, Pasuruan, Jawa Timur 67153
					</li>
					<li class="opacity-80 transition-opacity hover:opacity-100">📞 0812-3456-7890</li>
					<li class="opacity-80 transition-opacity hover:opacity-100">✉️ email@gmail.com</li>
				</ul>
			</div>
			<!-- Menu -->
			<div class="md:text-end">
				<h4 class="mb-4 text-lg font-semibold text-title-text">Menu</h4>
				<ul class="stack-sm text-sm">
					{#each navItems as item, i (i)}
						<li><a href={item.path} class="footer-link capitalize">{item.name}</a></li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Divider -->
		<div class="mb-6 h-px bg-linear-to-r from-transparent via-secondary/40 to-transparent"></div>

		<!-- Bottom -->
		<div class="flex flex-col items-center justify-between text-sm opacity-60 md:flex-row">
			<p>© 2026 HIMATIF ITB Yadika. All rights reserved.</p>
			<p>Dibuat dengan ❤️ oleh Devisi DBM</p>
		</div>
	</div>
</footer>

<style>
	.footer-link {
		position: relative;
		transition: color var(--duration-normal) var(--ease-out-expo);
	}
	.footer-link:hover {
		color: var(--color-secondary);
	}
	.footer-link::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 1.5px;
		background: var(--color-secondary);
		border-radius: 1px;
		transition: width var(--duration-normal) var(--ease-out-expo);
	}
	.footer-link:hover::after {
		width: 100%;
	}
</style>
