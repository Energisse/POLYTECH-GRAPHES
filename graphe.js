const fs = require('fs')
const Edge = require('./edge.js')
const Vertex = require('./vertex.js')


class Graphe {
    constructor(oriente = null, nbSommets = 0, nbArcs = 0, nbValeursParArc = 0, listeSommets = [], listeAjacent = []) {
        this.oriente = oriente;
        this.nbSommets = nbSommets;
        this.nbArcs = nbArcs;
        this.nbValeursParArc = nbValeursParArc;
        this.listeSommets = listeSommets;
        this.listeAjacent = listeAjacent;
        this.sommets = new Map()
    }

    loadFile(fileName) {
        const data = fs.readFileSync(fileName, 'utf-8')
        const [
            nom,
            commentaire,
            oriente,
            nbSommets,
            nbValeursParSommet,
            nbArcs,
            nbValeursParArc,
            ...rest
        ] = data.split("\n");

        this.oriente = oriente
        this.nbArcs = nbArcs;
        this.nbSommets = nbSommets;
        this.nbValeursParArc = nbValeursParArc;

        //Espace + label VERTICES ... 
        let i = 2;

        while (rest[i]) {
            const [id, sommet, ...valeurs] = rest[i].split(" ")
            this.sommets.set(sommet, id)
            this.listeSommets.push(new Vertex(sommet, valeurs))
            i++;
        }

        //Espace + label EDGES ... 
        i += 2;

        this.listeAjacent = Array(this.listeSommets.length).fill(undefined).map(() => [])
        while (rest[i]) {
            const [init, term, ...valeurs] = rest[i].split(" ")


            if (!oriente) {
                //Ajout des sommet dans le cas non orienté
                if (this.listeAjacent[term]) {
                    this.listeAjacent[term].push(new Edge(init, term, valeurs))
                }
                else {
                    this.listeAjacent[term] = [new Edge(init, term, valeurs)]
                }

            }
            else {
                this.listeSommets[init].degreExt += 1
                this.listeSommets[term].degreInt += 1
            }

            this.listeSommets[init].degre += 1
            this.listeSommets[term].degre += 1


            if (this.listeAjacent[init]) {
                this.listeAjacent[init].push(new Edge(init, term, valeurs))
            }
            else {
                this.listeAjacent[init] = [new Edge(init, term, valeurs)]
            }
            i++;
        }
    }

    print() {
        this.listeSommets.forEach(({ nom, valeurs, degre, degreExt, degreInt }) => {
            const id = this.sommets.get(nom);
            let arc = [];
            if (this.listeAjacent[id]) {
                arc = this.listeAjacent[id].map((
                    ({ term, init, valeurs }) => `${init} => ${term} (${valeurs})`
                )).join("\n\t\t\t")
            }

            console.log(`Le sommet "${nom}(${id})" de valeurs ${valeurs} 
                \td(${id}) = ${degre}
                \td(${id})+ = ${degreExt}
                \td(${id})- = ${degreInt}
                et pour arc:
                \t${arc}`);
        })

    }

    parcoursLargeur(init) {
        const file = [];
        const traite = []
        const marque = []
        let p = 1;


        this.listeSommets.forEach((sommet, id) => {
            traite[id] = 0;
            marque[id] = false;
        })

        marque[init] = true;
        file.push(init);

        while (file.length) {
            const sommet = file.shift();
            (this.listeAjacent[sommet] || []).forEach(({ term: adjacent }) => {
                if (marque[adjacent]) return;
                marque[adjacent] = true;
                file.push(adjacent)
            })
            traite[sommet] = p;
            p++;
        }
        return traite
    }

    parcoursProfondeur(init) {
        const pile = [];
        const traite = []
        const marque = []
        let p = 1;

        this.listeSommets.forEach((sommet, id) => {
            traite[id] = 0;
            marque[id] = false;
        })

        marque[init] = true;
        pile.push(init);
        while (pile.length) {
            while (true) {
                const topPile = pile[pile.length - 1]
                const successeur = this.listeAjacent[topPile].find(({ term }) => !marque[term])
                if (!successeur) break;
                pile.push(successeur.term);
                marque[successeur.term] = true;
            }
            const topPile = pile[pile.length - 1]
            traite[topPile] = p++;
            pile.pop()
        }
        return traite
    }
}

module.exports = Graphe