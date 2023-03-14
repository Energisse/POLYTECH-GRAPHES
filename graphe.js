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
        ] = data.replace(/\r/g,"").split("\n")

        this.oriente =  oriente.split(": ")[1] == "true";
        this.nbArcs = +nbArcs.split(": ")[1];
        this.nbSommets = +nbSommets.split(": ")[1];
        this.nbValeursParArc = +nbValeursParArc.split(": ")[1];

        //Espace + label VERTICES ... 
        let i = 2;

        for(;i < this.nbSommets + 2;i++ ){
            const [id, sommet, ...valeurs] = rest[i].split(" ")
            this.sommets.set(sommet, id)
            this.listeSommets.push(new Vertex(sommet, valeurs))
        }

        //Espace + label EDGES ... 
        i += 2;
        this.listeAjacent = Array(this.listeSommets.length).fill(undefined).map(() => [])
        while (rest[i]) {

            const [init, term, ...valeurs] = rest[i].split(" ").map(el=>+el)

            if (!this.oriente) {
                //Ajout des sommet dans le cas non orienté
                if (this.listeAjacent[term]) {
                    this.listeAjacent[term].push(new Edge( term,init, valeurs))
                }
                else {
                    this.listeAjacent[term] = [new Edge(term, init, valeurs)]
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
            traite[sommet] = p++;
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

    dijkstra(s,d){
        const marque = new Array(this.listeSommets.length).fill(false);
        const distances = new Array(this.listeSommets.length).fill(Infinity);
        const pred = new Array(this.listeSommets.length).fill(null);
        distances[s] = 0

        while( s != null){
            if(s == d)break;
            this.listeAjacent[s].forEach(({term,valeurs})=>{
                if(marque[term])return;
                const [distance] = valeurs;
                if(distances[s] + distance < distances[term]){
                    distances[term] = distances[s] + distance
                    pred[term] = s
                }

            })
            marque[s] = true
    
            let minDistance = Infinity;
            s = null
            distances.forEach((distance ,index)=>{
                if(marque[index])return;
                if(distance < minDistance){
                    minDistance = distance;
                    s = index
                }
            })
        }

        const chemin = [this.listeSommets[s].nom] 
        while(pred[s] != null){
            chemin.push(this.listeSommets[pred[s]].nom)
            s = pred[s]
        }
        console.log(chemin)
        return distances[d]

        // distances.forEach(val=>console.log(val))
        // pred.forEach(val=>console.log(val))

    }
}

module.exports = Graphe