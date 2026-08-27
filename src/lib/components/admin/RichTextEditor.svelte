<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import Highlight from "@tiptap/extension-highlight";
    
    // Icons
    import { 
        Bold, 
        Italic, 
        Heading1, 
        Heading2, 
        List, 
        ListOrdered, 
        Code, 
        SquareTerminal,
        Minus,
        Quote,
        Undo2,
        Redo2,
        Highlighter
    } from "@lucide/svelte";

    interface Props {
        name: string;
        label?: string;
        value?: string;
        error?: string;
    }

    let { 
        name, 
        label = "Konten (WYSIWYG)", 
        value = $bindable(""), 
        error = "" 
    }: Props = $props();

    let element: HTMLElement;
    let editor: Editor | null = $state(null);

    // Agar Svelte tau kapan harus meng-update state toggle button (aktif/mati)
    // Tiptap tidak otomatis trigger reactivity Svelte 5 tanpa listener
    let editorState = $state(0); 

    onMount(() => {
        editor = new Editor({
            element: element,
            content: value,
            extensions: [
                StarterKit.configure({
                    // StarterKit sudah mencakup Bold, Italic, Heading, BulletList, CodeBlock dll
                    heading: {
                        levels: [1, 2, 3],
                    },
                }),
                Highlight.configure({
                    multicolor: true, // Akan membiarkan kita memakai warna custom
                    HTMLAttributes: {
                        // Secara default beri warna primary yang direpresentasikan lewat var CSS
                        style: 'background-color: var(--color-primary); color: var(--color-title-text); padding: 0 4px; border-radius: 4px;'
                    }
                }),
            ],
            editorProps: {
                attributes: {
                    // Beri class tailwind "prose" supaya di dalam box editor, stylingnya seperti web aslinya
                    class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4 text-primary-text'
                }
            },
            onUpdate: ({ editor: e }) => {
                // Saat user ngetik, kita sinkronisasi value binding
                value = e.getHTML();
                // trigger force update Svelte binding button
                editorState++;
            },
            onSelectionUpdate: () => {
                // Saat user ngetik panah (kiri/kanan/blok teks), update state button (aktif/tidak aktif)
                editorState++;
            },
            onTransaction: () => {
                // Menangani transaction internal tiptap (undo/redo count)
                editorState++;
            }
        });
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
    });

    // Helper reaktif untuk mengecek button harus ditekan atau tidak
    // Menggunakan pemanggilan method dari editor
    const isActive = (type: string, options?: any) => {
        // hanya force trigger untuk memancing svelte re-evaluate baris ini 
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        editorState; 
        return editor ? editor.isActive(type, options) : false;
    }
    const canUndo = $derived(editor ? editor.can().undo() : false);
    const canRedo = $derived(editor ? editor.can().redo() : false);

</script>

<div class="form-control flex flex-col gap-2 w-full">
    <label class="text-sm font-bold text-primary-text opacity-90">
        {label}
        <span class="text-red-500">*</span>
    </label>

    <div class="rounded border bg-background/80 flex flex-col smooth-transition w-full
                {error ? 'border-red-500 focus-within:ring-red-500/50' : 'border-primary/20 focus-within:ring-2 focus-within:ring-primary/50'}">
        
        <!-- Toolbar Menu -->
        {#if editor}
        <!-- border-b dipakai sbg devider -->
        <div class="flex flex-wrap items-center gap-1 p-2 border-b border-primary/10 bg-primary/5 rounded-t">
            <!-- Font Style -->
            <button type="button" onclick={() => editor?.chain().focus().toggleBold().run()} class="p-2 rounded smooth-transition hover:bg-primary/20 {isActive('bold') ? 'bg-primary/30 text-secondary' : 'text-primary-text opacity-70'}">
                <Bold class="w-4 h-4" />
            </button>
            <button type="button" onclick={() => editor?.chain().focus().toggleItalic().run()} class="p-2 rounded smooth-transition hover:bg-primary/20 {isActive('italic') ? 'bg-primary/30 text-secondary' : 'text-primary-text opacity-70'}">
                <Italic class="w-4 h-4" />
            </button>
            <button type="button" onclick={() => editor?.chain().focus().toggleHighlight().run()} class="p-2 rounded smooth-transition hover:bg-primary/20 {isActive('highlight') ? 'bg-primary/30 text-secondary' : 'text-primary-text opacity-70'}" title="Highlight">
                <Highlighter class="w-4 h-4" />
            </button>
            
            <div class="w-px h-5 bg-primary/20 mx-1"></div>

            <!-- Headings -->
            <button type="button" onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} class="p-2 rounded smooth-transition hover:bg-primary/20 {isActive('heading', { level: 1 }) ? 'bg-primary/30 text-secondary' : 'text-primary-text opacity-70'}">
                <Heading1 class="w-4 h-4" />
            </button>
            <button type="button" onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} class="p-2 rounded smooth-transition hover:bg-primary/20 {isActive('heading', { level: 2 }) ? 'bg-primary/30 text-secondary' : 'text-primary-text opacity-70'}">
                <Heading2 class="w-4 h-4" />
            </button>
            
            <div class="w-px h-5 bg-primary/20 mx-1"></div>

            <!-- Lists -->
            <button type="button" onclick={() => editor?.chain().focus().toggleBulletList().run()} class="p-2 rounded smooth-transition hover:bg-primary/20 {isActive('bulletList') ? 'bg-primary/30 text-secondary' : 'text-primary-text opacity-70'}">
                <List class="w-4 h-4" />
            </button>
            <button type="button" onclick={() => editor?.chain().focus().toggleOrderedList().run()} class="p-2 rounded smooth-transition hover:bg-primary/20 {isActive('orderedList') ? 'bg-primary/30 text-secondary' : 'text-primary-text opacity-70'}">
                <ListOrdered class="w-4 h-4" />
            </button>

            <div class="w-px h-5 bg-primary/20 mx-1"></div>

            <!-- Blocks -->
            <button type="button" onclick={() => editor?.chain().focus().toggleCodeBlock().run()} class="p-2 rounded smooth-transition hover:bg-primary/20 {isActive('codeBlock') ? 'bg-primary/30 text-secondary' : 'text-primary-text opacity-70'}">
                <SquareTerminal class="w-4 h-4" />
            </button>
            <button type="button" onclick={() => editor?.chain().focus().toggleBlockquote().run()} class="p-2 rounded smooth-transition hover:bg-primary/20 {isActive('blockquote') ? 'bg-primary/30 text-secondary' : 'text-primary-text opacity-70'}">
                <Quote class="w-4 h-4" />
            </button>
            <button type="button" onclick={() => editor?.chain().focus().setHorizontalRule().run()} class="p-2 rounded smooth-transition hover:bg-primary/20 text-primary-text opacity-70" title="Garis Pembatas (HR)">
                <Minus class="w-4 h-4" />
            </button>

            <div class="flex-1"></div>

            <!-- Undo / Redo -->
            <button type="button" onclick={() => editor?.chain().focus().undo().run()} disabled={!canUndo} class="p-2 rounded smooth-transition hover:bg-primary/20 disabled:opacity-30 text-primary-text">
                <Undo2 class="w-4 h-4" />
            </button>
            <button type="button" onclick={() => editor?.chain().focus().redo().run()} disabled={!canRedo} class="p-2 rounded smooth-transition hover:bg-primary/20 disabled:opacity-30 text-primary-text">
                <Redo2 class="w-4 h-4" />
            </button>
        </div>
        {/if}

        <!-- Area Editor Teks (Tiptap ditaruh disini via bind) -->
        <!-- Sveltekit Form memerlukan input value biasa untuk dikirim ke backend -->
        <input type="hidden" {name} {value} />
        
        <!-- Box Penulis -->
        <!-- Global class ditangani tiptap `editorProps` -->
        <div bind:this={element} class="bg-surface/50 rounded-b"></div>

    </div>

    {#if error}
        <span class="text-xs font-semibold text-red-500 mt-1">{error}</span>
    {/if}
</div>

<style>
    /* Styling khusus agar Tiptap tidak menunjukkan outline border saat kursor di dalam (krn sudah dihandle div luarnya) */
    :global(.ProseMirror) {
        outline: none;
    }

    /* Modifikasi kecil untuk codeblock editor agar sedikit beda bg nya */
    :global(.ProseMirror pre) {
        background-color: rgba(0, 0, 0, 0.8);
        color: #fff;
        border-radius: 0.5rem;
        padding: 1rem;
    }
</style>