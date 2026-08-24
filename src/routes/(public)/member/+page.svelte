<script lang="ts">
	import Bph from "$lib/components/memberCard/Bph.svelte";
	import Kadiv from "$lib/components/memberCard/Kadiv.svelte";
	import Member from "$lib/components/memberCard/Member.svelte";
	import MemberListWrapper from "$lib/components/MemberListWrapper.svelte";

	import { Landmark, UserStar, Users } from "@lucide/svelte";
	import { setLucideProps } from "@lucide/svelte";

	setLucideProps({
		strokeWidth: 2
	});

	let { data } = $props();

	const bphList = $derived(data.bph);
	const kadivList = $derived(data.kadiv);
	const memberList = $derived(data.member);
	const alumni = $derived(data.alumni);
</script>


<section class="min-w-full bg-gradient-surface stack section px-3 mt-3 relative overflow-hidden section">
    <div class="absolute inset-0 bg-dot-pattern pointer-events-none"></div>
    <div class="flex flex-col stack-lg gap-4 container relative z-10">
        <div class="header flex flex-col items-start gap-3 justify-center">
            <span class="badge-pill bg-secondary text-slate-100 capitalize text-center">
                struktur anggota HIMATIF
            </span>
            <h1 class="head text-4xl font-extrabold text-title-text mb-3 tracking-tight">Anggota <span class="gradient-text">HIMATIF</span></h1>
            <p class="max-w-4xl text-lg/7 leading-relaxed opacity-80">Struktur inti HIMATIF ITB Yadika. Kenali sosok-sosok berdedikasi yang menggerakkan inovasi teknologi dan keunggulan akademik.</p>
        </div>
    </div>
</section>

<section class="list-wrapper container stack-lg section">
	<MemberListWrapper jabatan="Badan Pengurus Harian">
	{#snippet icon()}
		<Landmark />
	{/snippet}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:justify-items-center">
		{#each bphList as member (member.id)}
			<Bph name={member.name} position="Badan Pengurus Harian" imageUrl={member.imageUrl} />
		{/each}
	</div>
	
	</MemberListWrapper>

	<MemberListWrapper jabatan="Ketua Divisi">
	{#snippet icon()}
		<UserStar />
	{/snippet}
		<div class=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 justify-items-center">
			{#each kadivList as member (member.id)}
				<Kadiv name={member.name} position="Ketua Divisi" imageUrl={member.imageUrl} devisi={member.devisi?.nama || "-"} />
			{/each}
		</div>
	</MemberListWrapper>

	<MemberListWrapper jabatan="Anggota">
	{#snippet icon()}
		<Users />
	{/snippet}
		<div class=" grid-autofit justify-items-center">
			{#each memberList as member (member.id)}
				<Member name={member.name} devisi={member.devisi?.nama || "-"} imageUrl={member.imageUrl} />
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