require.config({
    paths: {
        vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs"
    }
});

require(["vs/editor/editor.main"], function () {
    monaco.languages.register({
        id: "oca"
    });

    monaco.languages.setMonarchTokensProvider("oca", {
        tokenizer: {
            root: [
                [/#.*/, "comment"]
            ]
        }
    });

    monaco.editor.defineTheme("dark-with-green-comments", {
        base: "vs-dark",
        inherit: true,

        rules: [
            {
                token: "comment",
                foreground: "6A9955"
            }
        ],

        colors: {
            "editor.foreground": "#FFFFFF",
            "editor.background": "#1E1E1E"
        }
    });

    window.editor = monaco.editor.create(
        document.getElementById("container"),
        {
            value: "# One Command Assembler by The_CommanderRS\n# tested on 1.21.4\n\n",
            language: "oca",
            theme: "dark-with-green-comments",
            fontSize: 14,
            minimap: {
                enabled: false
            },
            wordWrap: "off"
        }
    );
});