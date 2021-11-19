import {patp2dec} from "urbit-ob";

const p = ["bac", "bal", "ban", "bar", "bat", "bic", "bid", "bil", "bin", "bis", "bit",
    "bol", "bon", "bor", "bos", "bot", "dab", "dac", "dal", "dan", "dap", "dar",
    "das", "dat", "dav", "dib", "dif", "dig", "dil", "din", "dir", "dis", "div",
    "doc", "dol", "don", "dop", "dor", "dos", "dot", "dov", "doz", "fab", "fad",
    "fal", "fam", "fan", "fas", "fid", "fig", "fil", "fin", "fip", "fir", "fit",
    "fod", "fog", "fol", "fon", "fop", "for", "fos", "fot", "hab", "hac", "had",
    "hal", "han", "hap", "har", "has", "hat", "hav", "hid", "hil", "hin", "hob",
    "hoc", "hod", "hol", "hop", "hos", "lab", "lac", "lad", "lag", "lan", "lap",
    "lar", "las", "lat", "lav", "lib", "lid", "lig", "lin", "lis", "lit", "liv",
    "loc", "lod", "lom", "lon", "lop", "lor", "los", "mac", "mag", "mal", "map",
    "mar", "mas", "mat", "mic", "mid", "mig", "mil", "min", "mip", "mir", "mis",
    "mit", "moc", "mod", "mog", "mol", "mon", "mop", "mor", "mos", "mot", "nac",
    "nal", "nam", "nap", "nar", "nat", "nav", "nib", "nid", "nil", "nim", "nis",
    "noc", "nod", "nol", "nom", "nop", "nor", "nos", "nov", "pac", "pad", "pag",
    "pal", "pan", "par", "pas", "pat", "pic", "pid", "pil", "pin", "pit", "poc",
    "pod", "pol", "pon", "pos", "rab", "rac", "rad", "rag", "ral", "ram", "ran",
    "rap", "rav", "rib", "ric", "rid", "rig", "ril", "rin", "rip", "ris", "rit",
    "riv", "roc", "rol", "ron", "rop", "ros", "rov", "sab", "sal", "sam", "san",
    "sap", "sar", "sat", "sav", "sib", "sic", "sid", "sig", "sil", "sim", "sip",
    "sit", "siv", "soc", "sog", "sol", "som", "son", "sop", "sor", "sov", "tab",
    "tac", "tad", "tag", "tal", "tam", "tan", "tap", "tar", "tas", "tic", "tid",
    "til", "tim", "tin", "tip", "tir", "tob", "toc", "tod", "tog", "tol", "tom",
    "ton", "top", "tor", "wac", "wal", "wan", "wat", "wic", "wid", "win", "wis",
    "wit", "wol", "wor"]

const s = ["bec", "bel", "ben", "bep", "ber", "bes", "bet", "bex", "bud", "bur", "bus",
    "byl", "byn", "byr", "byt", "deb", "dec", "def", "deg", "del", "dem", "den",
    "dep", "der", "des", "det", "dev", "dex", "duc", "dul", "dun", "dur", "dus",
    "dut", "dux", "dyl", "dyn", "dyr", "dys", "dyt", "feb", "fed", "fel", "fen",
    "fep", "fer", "fes", "fet", "fex", "ful", "fun", "fur", "fus", "fyl", "fyn",
    "fyr", "heb", "hec", "hep", "hes", "het", "hex", "hul", "hus", "hut", "leb",
    "lec", "led", "leg", "len", "lep", "ler", "let", "lev", "lex", "luc", "lud",
    "lug", "lun", "lup", "lur", "lus", "lut", "lux", "lyd", "lyn", "lyr", "lys",
    "lyt", "lyx", "meb", "mec", "med", "meg", "mel", "mep", "mer", "mes", "met",
    "mev", "mex", "mud", "mug", "mul", "mun", "mur", "mus", "mut", "myl", "myn",
    "myr", "neb", "nec", "ned", "nel", "nem", "nep", "ner", "nes", "net", "nev",
    "nex", "nub", "nul", "num", "nup", "nus", "nut", "nux", "nyd", "nyl", "nym",
    "nyr", "nys", "nyt", "nyx", "pec", "ped", "peg", "pel", "pem", "pen", "per",
    "pes", "pet", "pex", "pub", "pun", "pur", "put", "pyl", "pyx", "reb", "rec",
    "red", "ref", "reg", "rel", "rem", "ren", "rep", "res", "ret", "rev", "rex",
    "ruc", "rud", "rul", "rum", "run", "rup", "rus", "rut", "rux", "ryc", "ryd",
    "ryg", "ryl", "rym", "ryn", "ryp", "rys", "ryt", "ryx", "seb", "sec", "sed",
    "sef", "seg", "sel", "sem", "sen", "sep", "ser", "set", "sev", "sub", "sud",
    "sug", "sul", "sum", "sun", "sup", "sur", "sut", "syd", "syl", "sym", "syn",
    "syp", "syr", "syt", "syx", "teb", "tec", "ted", "teg", "tel", "tem", "ten",
    "tep", "ter", "tes", "tev", "tex", "tuc", "tud", "tug", "tul", "tun", "tus",
    "tux", "tyc", "tyd", "tyl", "tyn", "typ", "tyr", "tyv", "web", "wed", "weg",
    "wel", "wen", "wep", "wer", "wes", "wet", "wex", "wyc", "wyd", "wyl", "wyn",
    "wyt", "wyx", "zod"]

const initials = "bdfhlmnprstwz".split("");
const finals = "cdglmnprstvx".split("");
const vowels = "aeiouy".split("");
export function liveCheckPatp(input: string): boolean {
    const i = input.replace(/-/g, "");
    if (i[0] !== "~") return false
    else {
        const syllables = i.slice(1).match(/.{1,3}/g);
        console.log(syllables, "syllables")
        if (syllables) return checkSyllables(syllables)
        else return false
    }
}
function checkSyllables(list: string[]): boolean {
    if (list.length === 1) {
        if (s.includes(list[0])) return true
        else return false
    }
    else if (list.length === 2) {
        if (s.includes(list[list.length - 1]) && p.includes(list[list.length - 2])) return true
    }
    else {
        if (s.includes(list[list.length - 1]) && p.includes(list[list.length - 2])) return checkSyllables(list.slice(0, list.length - 2))
        else return false
    }
}


export function addDashes(p: string): string {
    const list = p.replace(/[~-]/g, "").match(/.{1,6}/g);
    console.log(list, "list")
    console.log(list.join("-"))
    return "~" + list.join("-")
}

export function buildChatPost(author, resource, text) {
    return {
        app: "graph-push-hook", mark: "graph-update-3", json: {
            "add-nodes": {
                resource: { name: resource.name, ship: "~" + resource.ship },
                nodes: {
                    "/9": {
                        children: null,
                        post: {
                            author: "~" + author,
                            contents: [{text: text}],
                            hash: null,
                            index: "/9",
                            signatures: [],
                            "time-sent": Date.now()
                        }
                    }
                }

            }
        }
    };
}
export function buildNotebookPost(author, resource, title, text) {
    const node = {};
    const index = `/${makeIndex()}`;
    node[index] =  {
            children: {
              "1":{
                post: {
                    author: "~" + author,
                    contents: [],
                    hash: null,
                    index: index + "/1",
                    signatures: [],
                    "time-sent": Date.now()
                },
                children:{
                    "1":{
                        children: null,
                        post: {
                            author: "~" + author,
                            contents: [{text: title}, {text: text}],
                            hash: null,
                            index: index + "/1/1",
                            signatures: [],
                            "time-sent": Date.now()
                        }

                    }
                }
              },
              "2":{
                  children: null,
                  post: {
                    author: "~" + author,
                    contents: [],
                    hash: null,
                    index: index + "/2",
                    signatures: [],
                    "time-sent": Date.now()
                }
              }
            },
            post: {
                author: "~" + author,
                contents: [],
                hash: null,
                index: index,
                signatures: [],
                "time-sent": Date.now()
            }
        }
    return {
        app: "graph-push-hook", mark: "graph-update-3", json: {
            "add-nodes": {
                resource: { name: resource.name, ship: "~" + resource.ship },
                nodes: node
            }
        }
    };
}
export function buildCollectionPost(author, resource, title: string, url: string) {
    const node = {};
    const index = `/${makeIndex()}`;
    node[index] =  {
            children: null,
            post: {
                author: "~" + author,
                contents: [{text: title}, {url: url}],
                hash: null,
                index: index,
                signatures: [],
                "time-sent": Date.now()
            }
        }
    return {
        app: "graph-push-hook", mark: "graph-update-3", json: {
            "add-nodes": {
                resource: { name: resource.name, ship: "~" + resource.ship },
                nodes: node
            }
        }
    };
}
export function buildDM(author, recipient, text: string) {
    const node = {};
    const point = patp2dec(recipient);
    console.log(point, "point")
    const index = `/${point}/${makeIndex()}`;
    node[index] =  {
            children: null,
            post: {
                author: "~" + author,
                contents: [{text: text}],
                hash: null,
                index: index,
                signatures: [],
                "time-sent": Date.now()
            }
        }
    return {
        app: "dm-hook", mark: "graph-update-3", json: {
            "add-nodes": {
                resource: { name: "dm-inbox", ship: "~" + author },
                nodes: node
            }
        }
    };
}
function makeIndex(){
  const DA_UNIX_EPOCH = BigInt('170141184475152167957503069145530368000');
  const DA_SECOND = BigInt('18446744073709551616');
  const timeSinceEpoch = (BigInt(Date.now()) * DA_SECOND) / BigInt(1000);
  return (DA_UNIX_EPOCH + timeSinceEpoch).toString()
}

