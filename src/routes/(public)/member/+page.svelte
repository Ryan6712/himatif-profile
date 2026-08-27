<script lang="ts">
	import Bph from '$lib/components/memberCard/Bph.svelte';
	import Kadiv from '$lib/components/memberCard/Kadiv.svelte';
	import Member from '$lib/components/memberCard/Member.svelte';
	import MemberListWrapper from '$lib/components/MemberListWrapper.svelte';

	import { Landmark, UserStar, Users } from '@lucide/svelte';
	import { setLucideProps } from '@lucide/svelte';

	setLucideProps({
		strokeWidth: 2
	});

	let { data } = $props();

	const bphList = $derived(data.bph);
	const kadivList = $derived(data.kadiv);
	const memberList = $derived(data.member);
	const alumni = $derived(data.alumni);
</script>

<svelte:head>
	<title>Anggota - HIMATIF ITB Yadika</title>
	<meta name="description" content="Kenali struktur kepengurusan dan anggota HIMATIF ITB Yadika, dari BPH, Ketua Divisi, hingga anggota aktif dan alumni." />
</svelte:head>

<section
	class="bg-gradient-surface stack section section relative mt-3 min-w-full overflow-hidden px-3"
>
	<div class="bg-dot-pattern pointer-events-none absolute inset-0"></div>
	<div class="stack-lg relative z-10 container flex flex-col gap-4">
		<div class="header flex flex-col items-start justify-center gap-3">
			<span class="badge-pill bg-secondary text-center text-slate-100 capitalize">
				struktur anggota HIMATIF
			</span>
			<h1 class="head mb-3 text-4xl font-extrabold tracking-tight text-title-text">
				Anggota <span class="gradient-text">HIMATIF</span>
			</h1>
			<p class="max-w-4xl text-lg/7 leading-relaxed opacity-80">
				Struktur inti HIMATIF ITB Yadika. Kenali sosok-sosok berdedikasi yang menggerakkan inovasi
				teknologi dan keunggulan akademik.
			</p>
		</div>
	</div>
</section>

<section class="list-wrapper stack-lg section container">
	<MemberListWrapper jabatan="Badan Pengurus Harian">
		{#snippet icon()}
			<Landmark />
		{/snippet}
		<div
			class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 md:justify-items-center lg:grid-cols-4"
		>
			{#each bphList as member (member.id)}
				<Bph name={member.name} position="Badan Pengurus Harian" imageUrl={member.imageUrl} />
			{/each}
		</div>
	</MemberListWrapper>

	<MemberListWrapper jabatan="Ketua Divisi">
		{#snippet icon()}
			<UserStar />
		{/snippet}
		<div class=" grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 md:grid-cols-3">
			{#each kadivList as member (member.id)}
				<Kadiv
					name={member.name}
					position="Ketua Divisi"
					imageUrl={member.imageUrl}
					devisi={member.devisi?.nama || '-'}
				/>
			{/each}
		</div>
	</MemberListWrapper>

	<MemberListWrapper jabatan="Anggota">
		{#snippet icon()}
			<Users />
		{/snippet}
		<div class=" grid-autofit justify-items-center">
			{#each memberList as member (member.id)}
				<Member name={member.name} devisi={member.devisi?.nama || '-'} imageUrl={member.imageUrl} />
			{/each}
		</div>
	</MemberListWrapper>

	<MemberListWrapper jabatan="Alumni">
		{#snippet icon()}
			<Users />
		{/snippet}
		<div class=" grid-autofit justify-items-center">
			{#each alumni as member (member.id)}
				<Member name={member.name} devisi="-" imageUrl={member.imageUrl} />
			{/each}
		</div>
	</MemberListWrapper>
</section>

<style>
	.grid-autofit {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1.25rem;
	}
</style>
