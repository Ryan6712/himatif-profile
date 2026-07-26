<script lang="ts">
    import { page } from "$app/state";
	import { fade, fly } from "svelte/transition";

    let isOpen = $state(false);

    interface NavLink {
        name: string;
        path: string;
    }

    let navItems: NavLink[] = [
        {
            name: "home",
            path: "/"
        },
        {
            name: "member",
            path: "/member"
        },
        {
            name: "proker",
            path: "/proker"
        },
        {
            name: "devisi",
            path: "/devisi"
        }
    ]

    const toggle = (): void => {
		isOpen = isOpen ? false : true;
	}
    

    if(page.url.pathname) isOpen = false;

</script>


<style>
    .active {
        color : var(--color-secondary-hover);
        border-bottom: solid 2px var(--color-secondary-hover);
    }
</style>

<nav class="bg-surface/90 rounded-full max-w-6xl mx-auto inset-x-0 fixed top-4 py-2 border border-tertiary shadow-md">
    <div class="container">
        <div class="flex items-center justify-between align-middle">
            <div class="logo flex items-center">
                <a href="/">
                    <img src="https://placehold.co/215x35/png?text=himatif" alt="" class="drop-shadow-sm drop-shadow-primary/60" >
                </a>
            </div>
            <ul class="hidden gap-8 md:flex">
            {#each navItems as item}
                <li><a href="{item.path}" class="hover:text-secondary-hover hover:border-b-2 border-b-secondary-hover capitalize" class:active={page.url.pathname == item.path}>{item.name}</a></li>
            {/each}
            </ul>
            <button class="bg-secondary hover:bg-secondary-hover text-white rounded-full py-2 px-3 hidden md:block pointer-events-auto cursor-pointer shadow-md">
                <a href="mailto:himatif@stmik-yadika.ac.id">
                    Hubungi kami
                </a>
            </button>

            <button
                onclick={toggle}
                aria-label="Toggle navigation menu"
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                class="btn btn-primary relative flex h-8 w-8 flex-col justify-center items-center rounded-full pointer-events-auto md:hidden"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path>
            </svg>
            </button>
        </div>
    </div>
</nav>

{#if isOpen}
<div class="blur md:hidden fixed inset-0  backdrop-blur-xs z-30" in:fade={{ duration : 400 }} out:fade={{ duration:100}}></div>
<div id="mobile-menu" class="md:hidden flex flex-col fixed top-0 right-0 w-80 h-full min-h-screen bg-surface shadow-xl z-100 pb-4" in:fly={{x:300, duration : 400 }} out:fly={{ x: 300, duration:400}}>
    <div class="flex justify-between w-full items-center bg-surface h-16 p-1 shadow-sm">
        <img src="https://placehold.co/215x35/png?text=himatif" alt="" class="w-auto h-8">
        <button
            onclick={toggle}
            aria-label="Toggle navigation menu"
            aria-controls="mobile-menu"
            class="h-8 w-8 p-2 rounded-full btn btn-primary"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>

    </div>
    <ul class="flex flex-col stack container mt-4 text-primary-text">
        <li><a href="/" class="hover:text-primary text-lg">Home</a></li>
        <li><a href="/about" class="hover:text-primary text-lg">About</a></li>
        <li><a href="/products" class="hover:text-primary text-lg">Product</a></li>
        <li><a href="/contact" class="hover:text-primary text-lg">Contact</a></li>
    </ul>
    <button class="bg-secondary hover:bg-secondary-hover px-6 py-3 rounded-full text-white mt-auto shadow-md">
        Hubungi kami
    </button>
</div>
{/if}

