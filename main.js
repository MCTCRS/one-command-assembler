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
    standard: {
        packCommands: (/*list<str>*/ commands, /*str*/ data) => {
            const insertData = data ? `data:${data},Tags:["OCMD_DATA"],` : "";
            const passengers = `{${insertData}id:command_block_minecart,Command:"${commands.join('"},{id:command_block_minecart,Command:"')}"}`;
            return `summon falling_block ~ ~.5 ~ {BlockState:{Name:glass},Passengers:[{id:armor_stand,Small:1,Health:0,Passengers:[{id:item,Item:{id:stone,count:1},Age:5998,Passengers:[{id:falling_block,BlockState:{Name:redstone_block},Passengers:[{id:falling_block,BlockState:{Name:"activator_rail"},Passengers:[${passengers},{id:command_block_minecart,Command:"setblock ~ ~1 ~ command_block{Command:\\"fill ~ ~ ~ ~ ~-4 ~ air\\",auto:1}"},{id:command_block_minecart,Command:"kill @e[type=command_block_minecart,distance=..1]"}]}]}]}]}]}`;
        },
        
        dataPath: () => {
            return "entity @n[tag=OCMD_DATA,type=command_block_minecart] data";
        }
    },

    compact: {
        packCommands: (/*list<str>*/ commands, /*str*/ data) => {
            const insertData = data ? `data:${data},` : "";
            const instructions = commands.reverse().join("\",\"");
            return `setblock ~ ~ ~ minecraft:command_block[facing=up]{auto:1,components:{custom_data:{${insertData}cmds:["fill ~ ~1 ~ ~1 ~-1 ~ air strict","${instructions}","data modify block ~ ~1 ~ Command set value \\"data remove block ~ ~-2 ~ components.minecraft:custom_data.cmds[-1]\\""]}},Command:'setblock ~ ~1 ~ minecraft:chain_command_block[facing=up]{auto:1,UpdateLastExecution:0,Command:"setblock ~ ~1 ~ chain_command_block[facing=east]{UpdateLastExecution:0,auto:1,Command:\\\\"setblock ~1 ~ ~ chain_command_block[facing=down]{UpdateLastExecution:1,auto:1,powerd:1,Command:\\\\\\\\\\\\"execute store result block ~ ~ ~ auto byte 0 run setblock ~ ~-1 ~ chain_command_block[facing=west]{UpdateLastExecution:0,auto:1,Command:\\\\\\\\\\\\\\\\\\\\\\\\\\\\"data modify block ~-1 ~ ~ Command set from block ~-1 ~-1 ~ components.minecraft:custom_data.cmds[-1]\\\\\\\\\\\\\\\\\\\\\\\\\\\\"} strict\\\\\\\\\\\\"} strict\\\\"} strict"} strict'} destroy`;
        },

        dataPath: () => {
            return "block ~ ~-1 ~ components.minecraft:custom_data.data";
        }
    }
}

const oneCMD = {
    compileCode: function(source) {
        let sourceLines = source.split('\n');
        sourceLines = sourceLines.map(line => line.trim());
        sourceLines = sourceLines.filter(line => line !== '');
        sourceLines = sourceLines.filter(line => line[0] !== '#');

        const dataKey = "$DATA"
        const dataLine = sourceLines.filter(line => line.startsWith(dataKey));
        sourceLines = sourceLines.filter(line => !line.startsWith(dataKey));

        let data = null;
        if (dataLine.length > 1) console.warn("DATA should only be define once, using the first one for now");
        if (dataLine.length > 0) {
            console.warn("$DATA usage detected! make sure the argument is a valid object!");
            data = dataLine[0].slice(dataKey.length).trim();
        }


        const packer = assemblers[modeSelect.value];
        const dataPath = packer.dataPath()
        console.log(dataPath)
        
        sourceLines = sourceLines.map(line =>
            line.replace(/\$\$DATA|\$DATA/g, match => {
                return match === "$$DATA" ? "$DATA" : dataPath;
            })
        );

        sourceLines = sourceLines.map(line => JSON.stringify(line).slice(1, -1));

        return packer.packCommands([...sourceLines], data);
    }
}


function packCommand(source) {
    return oneCMD.compileCode(source);
}
