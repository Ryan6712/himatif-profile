<script lang="ts">
	import { Github, Instagram, Mail, MapPin, Phone } from '@lucide/svelte';

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

<footer class="relative overflow-hidden bg-surface pt-20 pb-10 text-primary-text">
	<!-- Gradient border top and decorative background -->
	<div
		class="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-primary via-secondary to-tertiary"
	></div>
	<div
		class="pointer-events-none absolute -top-64 -right-64 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]"
	></div>
	<div
		class="pointer-events-none absolute bottom-0 -left-64 h-[500px] w-[500px] rounded-full bg-tertiary/5 blur-[100px]"
	></div>

	<div class="relative z-10 container mx-auto px-6">
		<div class="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-12">
			<!-- Brand (Takes up more space) -->
			<div class="lg:col-span-5">
				<!-- Logo 215x35 aspect ratio ~6:1 -->
				<img
					src={logoUrl}
					alt="HIMATIF Logo"
					width="215"
					height="35"
					loading="lazy"
					decoding="async"
					class="mb-6 h-[35px] w-auto max-w-[215px] object-contain"
				/>
				<p class="mb-8 max-w-md text-base leading-relaxed opacity-80">
					Himpunan Mahasiswa Teknologi Informasi ITB Yadika adalah wadah bagi mahasiswa Teknologi
					Informasi untuk berkolaborasi, mengeksplorasi, dan mengembangkan diri dalam bidang
					teknologi informasi.
				</p>

				<!-- Social Links -->
				<div class="flex items-center gap-4">
					<a
						href="#"
						aria-label="Instagram"
						class="group flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-secondary transition-all hover:scale-110 hover:bg-secondary hover:text-white"
					>
						<Instagram size={18} />
					</a>
					<a
						href="#"
						aria-label="Github"
						class="group flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-secondary transition-all hover:scale-110 hover:bg-secondary hover:text-white"
					>
						<Github size={18} />
					</a>
					<a
						href="mailto:himatif@stmik-yadika.ac.id"
						aria-label="Email"
						class="group flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-secondary transition-all hover:scale-110 hover:bg-secondary hover:text-white"
					>
						<Mail size={18} />
					</a>
				</div>
			</div>

			<!-- Contact -->
			<div class="lg:col-span-4 lg:pl-8">
				<h4 class="mb-6 flex items-center gap-2 text-lg font-bold text-title-text">
					<span class="inline-block h-1 w-8 rounded-full bg-secondary"></span>
					Kontak Kami
				</h4>
				<ul class="flex flex-col gap-4 text-base">
					<li class="group flex items-start gap-3 opacity-80 transition-opacity hover:opacity-100">
						<div
							class="mt-1 flex shrink-0 items-center justify-center text-secondary transition-transform group-hover:scale-110"
						>
							<MapPin size={18} />
						</div>
						<span>Kampus ITB Yadika Bangil, Kec. Bangil, Pasuruan, Jawa Timur 67153</span>
					</li>
					<li class="group flex items-center gap-3 opacity-80 transition-opacity hover:opacity-100">
						<div
							class="flex shrink-0 items-center justify-center text-secondary transition-transform group-hover:scale-110"
						>
							<Phone size={18} />
						</div>
						<span>0812-3456-7890</span>
					</li>
					<li class="group flex items-center gap-3 opacity-80 transition-opacity hover:opacity-100">
						<div
							class="flex shrink-0 items-center justify-center text-secondary transition-transform group-hover:scale-110"
						>
							<Mail size={18} />
						</div>
						<span>himatif@stmik-yadika.ac.id</span>
					</li>
				</ul>
			</div>

			<!-- Menu -->
			<div class="lg:col-span-3 lg:pl-8">
				<h4 class="mb-6 flex items-center gap-2 text-lg font-bold text-title-text">
					<span class="inline-block h-1 w-8 rounded-full bg-secondary"></span>
					Navigasi
				</h4>
				<ul class="flex flex-col gap-3 text-base">
					{#each navItems as item, i (i)}
						<li>
							<a
								href={item.path}
								class="footer-link group flex items-center gap-2 capitalize opacity-80 transition-all hover:text-secondary hover:opacity-100"
							>
								<span
									class="h-1.5 w-1.5 rounded-full bg-primary/40 transition-all group-hover:scale-150 group-hover:bg-secondary"
								></span>
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Divider -->
		<div class="mb-8 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>

		<!-- Bottom -->
		<div
			class="flex flex-col items-center justify-between gap-4 text-sm font-medium opacity-70 md:flex-row"
		>
			<p>© 2026 HIMATIF ITB Yadika. All rights reserved.</p>
			<p class="flex items-center gap-1.5">
				Dibuat dengan <span class="animate-pulse text-red-500">❤️</span> oleh Devisi DBM
			</p>
		</div>
	</div>
</footer>

<style>
	/* Removed old styles as they are now handled by Tailwind classes */
</style>
