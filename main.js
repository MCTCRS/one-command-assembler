const containerEl = document.getElementById("container");
const outputPageEl = document.getElementById("outputPage");
const convertBtn = document.getElementById("convertBtn");
const backBtn = document.getElementById("backBtn");
const outputBox = document.getElementById("outputBox");
const copyBtn = document.getElementById("copyBtn");
const modeSelect = document.getElementById("modeSelect");

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

modeSelect.addEventListener("change", () => {
    const text = editor.getValue();
    outputBox.value = packCommand(text);
});

const assemblers = {
    /*str*/ standard: (/*list<str>*/ commands) => {
        const passengers = `{id:command_block_minecart,Command:"${commands.join('"},{id:command_block_minecart,Command:"')}"}`;
        return `summon falling_block ~ ~.5 ~ {BlockState:{Name:glass},Passengers:[{id:armor_stand,Small:1,Health:0,Passengers:[{id:item,Item:{id:stone,count:1},Age:5998,Passengers:[{id:falling_block,BlockState:{Name:redstone_block},Passengers:[{id:falling_block,BlockState:{Name:"activator_rail"},Passengers:[${passengers},{id:command_block_minecart,Command:"setblock ~ ~1 ~ command_block{Command:\\"fill ~ ~ ~ ~ ~-4 ~ air\\",auto:1}"},{id:command_block_minecart,Command:"kill @e[type=command_block_minecart,distance=..1]"}]}]}]}]}]}`;
    },
    /*str*/ compact: (/*list<str>*/ commands) => {
        const instructions = commands.reverse().join("\",\"");
        return `setblock ~ ~ ~ minecraft:command_block[facing=up]{auto:1,components:{custom_data:{cmds:["fill ~ ~1 ~ ~1 ~-1 ~ air strict","${instructions}","data modify block ~ ~1 ~ Command set value \\"data remove block ~ ~-2 ~ components.minecraft:custom_data.cmds[-1]\\""]}},Command:'setblock ~ ~1 ~ minecraft:chain_command_block[facing=up]{auto:1,UpdateLastExecution:0,Command:"setblock ~ ~1 ~ chain_command_block[facing=east]{UpdateLastExecution:0,auto:1,Command:\\\\"setblock ~1 ~ ~ chain_command_block[facing=down]{UpdateLastExecution:1,auto:1,powerd:1,Command:\\\\\\\\\\\\"execute store result block ~ ~ ~ auto byte 0 run setblock ~ ~-1 ~ chain_command_block[facing=west]{UpdateLastExecution:0,auto:1,Command:\\\\\\\\\\\\\\\\\\\\\\\\\\\\"data modify block ~-1 ~ ~ Command set from block ~-1 ~-1 ~ components.minecraft:custom_data.cmds[-1]\\\\\\\\\\\\\\\\\\\\\\\\\\\\"} strict\\\\\\\\\\\\"} strict\\\\"} strict"} strict'} destroy`;
    }
}

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

        return assemblers[modeSelect.value]([...sourceLines]);
    }
}


function packCommand(source) {
    return oneCMD.compileCode(source);
}
