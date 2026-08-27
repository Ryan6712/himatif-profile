<script lang="ts">
    import { page } from "$app/state";
	import { fade, fly } from "svelte/transition";
    import { Menu, X } from "@lucide/svelte"

    let isOpen = $state(false);

    interface NavLink {
        name: string;
        path: string;
    }

    let { logoUrl } = $props()

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
            name: "program kerja",
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
    .nav-link {
        position: relative;
        transition: color var(--duration-normal) var(--ease-out-expo);
    }
    .nav-link::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 50%;
        width: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
        border-radius: 2px;
        transition: width var(--duration-normal) var(--ease-out-expo),
                    left var(--duration-normal) var(--ease-out-expo);
    }
    .nav-link:hover::after {
        width: 100%;
        left: 0;
    }
    .active {
        color: var(--color-secondary);
        background: rgba(123, 237, 79, 0.15);
        padding: 4px 12px;
        border-radius: 9999px;
        font-weight: 600;
    }
    .active::after {
        display: none;
    }

    .mobile-link {
        display: block;
        padding: 10px 16px;
        border-radius: 12px;
        transition: all var(--duration-fast) var(--ease-out-expo);
    }
    .mobile-link:hover {
        background: rgba(123, 237, 79, 0.12);
        padding-left: 24px;
    }
</style>

<nav class="bg-surface/70 backdrop-blur-xl rounded-full max-w-7xl mx-auto inset-x-0 fixed top-4 py-1 border border-tertiary/40 z-50" style="box-shadow: var(--shadow-card-md);">
    <div class="container">
        <div class="flex items-center justify-between align-middle">
            <div class="logo flex items-center shrink-0">
                <a href="/">
                    <!-- Logo 215x35 aspect ratio ~6:1 -->
                    <img src={logoUrl} alt="HIMATIF Logo" width="215" height="35" class="drop-shadow-sm drop-shadow-primary/60 w-[215px] h-[35px] object-fill" >
                </a>
            </div>
            <ul class="hidden gap-8 md:flex items-center">
            {#each navItems as item (item.name)}
                <li><a href="{item.path}" class="nav-link hover:text-secondary capitalize" class:active={page.url.pathname == item.path}>{item.name}</a></li>
            {/each}
            </ul>
            <button class="btn-cta py-2 px-5 hidden md:block pointer-events-auto cursor-pointer">
                <a href="mailto:himatif@stmik-yadika.ac.id" data-sveltekit-reload rel="external">
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
            <Menu />
            </button>
        </div>
    </div>
</nav>

{#if isOpen}
<div class="blur md:hidden fixed inset-0 backdrop-blur-sm bg-title-text/20 z-30" in:fade={{ duration : 300 }} out:fade={{ duration:150}}></div>
<div id="mobile-menu" class="md:hidden flex flex-col fixed top-0 right-0 w-80 h-full min-h-screen bg-surface/90 backdrop-blur-xl z-100 pb-4" style="box-shadow: var(--shadow-card-xl);" in:fly={{x:300, duration : 400 }} out:fly={{ x: 300, duration:300}}>
    <div class="flex justify-between w-full items-center h-16 p-3 shrink-0">
        <img src={logoUrl} alt="HIMATIF Logo" width="215" height="35" class="w-[215px] h-[35px] object-fill">
        <button
            onclick={toggle}
            aria-label="Toggle navigation menu"
            aria-controls="mobile-menu"
            class="h-8 w-8 p-2 rounded-full btn btn-primary hover:bg-primary/20 transition-colors"
        >
            <X/>
        </button>

    </div>
    <div class="mx-4 mb-4 h-px bg-linear-to-r from-primary/40 via-secondary/30 to-transparent"></div>
    <ul class="flex flex-col container mt-2 text-primary-text">
    {#each navItems as item (item.name)}
        <li><a href={item.path} class="mobile-link text-lg capitalize">{item.name}</a></li>
    {/each}
    </ul>
    <div class="mt-auto mx-4">
        <button class="btn-cta py-3 px-6 w-full">
            <a href="mailto:himatif@stmik-yadika.ac.id" data-sveltekit-reload>
                Hubungi kami
            </a>
        </button>
    </div>
</div>
{/if}
