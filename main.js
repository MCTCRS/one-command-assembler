const containerEl = document.getElementById("container");
const outputPageEl = document.getElementById("outputPage");
const convertBtn = document.getElementById("convertBtn");
const backBtn = document.getElementById("backBtn");
const outputBox = document.getElementById("outputBox");
const copyBtn = document.getElementById("copyBtn");

convertBtn.addEventListener("click", () => {
    const text = editor.getValue();

    outputBox.value = packCommand(text);

    containerEl.classList.remove("active");
    outputPageEl.classList.add("active");

    convertBtn.style.display = "none";
    backBtn.style.display = "inline-block";
});

backBtn.addEventListener("click", () => {
    outputPageEl.classList.remove("active");
    containerEl.classList.add("active");

    backBtn.style.display = "none";
    convertBtn.style.display = "inline-block";
});

copyBtn.addEventListener("click", () => {
    outputBox.select();
    document.execCommand("copy");
});


const oneCMD = {
    compileCode: function(source) {
        let sourceLines = source.split('\n');
        sourceLines = sourceLines.map(line => line.trim());
        sourceLines = sourceLines.filter(line => line !== '');
        sourceLines = sourceLines.filter(line => line[0] !== '#');

        let escape = [0];
        sourceLines = sourceLines.map(line => {
            escape[0] = line;
            return JSON.stringify(escape).slice(2, -2);
        });

        let passengers = `{id:command_block_minecart,Command:"${sourceLines.join('"},{id:command_block_minecart,Command:"')}"}`;
        return `summon falling_block ~ ~.5 ~ {BlockState:{Name:glass},Passengers:[{id:armor_stand,Small:1,Health:0,Passengers:[{id:item,Item:{id:stone,count:1},Age:5998,Passengers:[{id:falling_block,BlockState:{Name:redstone_block},Passengers:[{id:falling_block,BlockState:{Name:"activator_rail"},Passengers:[${passengers},{id:command_block_minecart,Command:"setblock ~ ~1 ~ command_block{Command:\\"fill ~ ~ ~ ~ ~-4 ~ air\\",auto:1}"},{id:command_block_minecart,Command:"kill @e[type=command_block_minecart,distance=..1]"}]}]}]}]}]}`;
    }
}


function packCommand(source) {
    return oneCMD.compileCode(source);
}
