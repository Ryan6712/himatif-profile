<script lang="ts">
	import Bph from "$lib/components/memberCard/Bph.svelte";
	import Kadiv from "$lib/components/memberCard/Kadiv.svelte";
	import Member from "$lib/components/memberCard/Member.svelte";
	import MemberListWrapper from "$lib/components/MemberListWrapper.svelte";

	let { data } = $props();

	const dummyBph = $derived(data.bph);
	const dummyKadiv = $derived(data.kadiv);
	const dummyMember = $derived(data.member);
</script>


<section class="min-w-full bg-gradient-surface stack section px-3 mt-3 relative overflow-hidden section">
    <div class="absolute inset-0 bg-dot-pattern pointer-events-none"></div>
    <div class="flex flex-col stack-lg gap-4 container relative z-10">
        <div class="header flex flex-col items-start gap-3 justify-center">
            <span class="badge-pill bg-secondary text-slate-100 capitalize text-center">
                struktur anggota HIMATIF
            </span>
            <h1 class="head text-4xl font-extrabold text-title-text mb-3 tracking-tight">Anggota <span class="gradient-text">HIMATIF</span></h1>
            <p class="max-w-4xl text-lg/7 leading-relaxed opacity-80">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sint, ullam eligendi! Aspernatur cupiditate dolor cumque vitae omnis deleniti illo numquam? Fugiat repellat accusamus assumenda repellendus quidem rem voluptatibus vel dolorum?</p>
        </div>
    </div>
</section>

<section class="list-wrapper container stack-lg section">
	<MemberListWrapper jabatan="BPH">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:justify-items-center">
		{#each dummyBph as member, i (i)}
			<Bph name={member.name} position={member.position} imageUrl={member.imageUrl} />
		{/each}
	</div>
	
	</MemberListWrapper>

	<MemberListWrapper jabatan="Kadiv">
		<div class=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 justify-items-center">
			{#each dummyKadiv as member, i (i)}
				<Kadiv name={member.name} position={member.position} imageUrl={member.imageUrl} devisi={member.devisi} />
			{/each}
		</div>
	</MemberListWrapper>

	<MemberListWrapper jabatan="Member">
		<div class=" grid-autofit justify-items-center">
			{#each dummyMember as member, i (i)}
				<Member name={member.name} devisi={member.devisi} imageUrl={member.imageUrl} />
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