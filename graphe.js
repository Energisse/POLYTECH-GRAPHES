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
        if(listeSommets){
            listeSommets.forEach((sommet, id) => {
                this.sommets.set(sommet.nom, sommet)
            });
        }
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

        this.listeAjacent = []
        this.listeSommets = []

        //Espace + label VERTICES ... 
        let i = 2;

        for(;i < this.nbSommets + 2;i++ ){
            const [id, sommet, ...valeurs] = rest[i].split(" ")
            const vertex = new Vertex(id,sommet, valeurs)
            this.sommets.set(sommet, vertex)
            this.listeSommets.push(new Vertex(id,sommet, valeurs))
        }

        //Espace + label EDGES ... 
        i += 2;
        this.listeAjacent = Array(this.listeSommets.length).fill(undefined).map(() => [])
        while (rest[i]) {

            const [init, term, ...valeurs] = rest[i].split(" ").map(el=>+el)

            if (!this.oriente) {
                //Ajout des sommet dans le cas non orienté
                if (this.listeAjacent[term]) {
                    this.listeAjacent[term].push(new Edge(term, init, valeurs))
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
            const {id} = this.sommets.get(nom);
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
            this.listeAjacent[sommet].forEach(({ term: adjacent }) => {
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
        if(d == null)return distances
        const chemin = [this.listeSommets[s].nom] 
        while(pred[s] != null){
            chemin.push(this.listeSommets[pred[s]].nom)
            s = pred[s]
        }
        
        return {distance:distances[d],chemin:chemin.reverse()}
    }

    prim(){
        const sommetArbre = [this.listeSommets[0]]
        const adjacentArbre = new Array(this.listeSommets.length).fill(undefined).map(() => [])


        while(sommetArbre.length < this.listeSommets.length){
            let min = Infinity;
            let minEdge = null;
            sommetArbre.forEach((sommet)=>{
                const adjacent = this.listeAjacent[sommet.id]
                adjacent.forEach((edge)=>{
                    if(sommetArbre.find(sommet => sommet.id == edge.term))return;
                    if(edge.valeurs[0] < min){
                        min = edge.valeurs[0]
                        minEdge = edge
                    }
                })
            })
            sommetArbre.push(this.listeSommets[minEdge.term])
            adjacentArbre[minEdge.init].push(minEdge)
        }


        return new Graphe(
            this.oriente,
            this.nbSommets,
            adjacentArbre.length,
            this.nbValeursParArc,
            //copie profonde
            this.listeSommets.map(el=>({...el})),
            adjacentArbre.map(el=>el.map(el=>({...el}))))
    }

    kruskal(){
        const numConnexe = new Array(this.listeSommets.length).fill(undefined).map((_,i)=>i);
        const adjacentArbre = new Array(this.listeSommets.length).fill(undefined).map(() => [])
        const nbElement = new Array(this.listeSommets.length).fill(1)

        //reduce arretes 
        const arretes = this.listeAjacent.reduce((acc,adjacent)=>{
            return [...acc,...adjacent]
        },[]).sort((a,b)=>a.valeurs[0] - b.valeurs[0])

        while(arretes.length){
            const arrete = arretes.shift()
            const {init,term} = arrete
            //si meme connexe alors création de cycle
            if(numConnexe[init] == numConnexe[term])continue;
            adjacentArbre[init].push(arrete)
            //Connexe le plus petit 
            const petitConnexe = nbElement[numConnexe[init]] <=  nbElement[numConnexe[term]] ? numConnexe[init] : numConnexe[term]
            const grandConnexe = nbElement[numConnexe[init]] > nbElement[numConnexe[term]] ? numConnexe[init] : numConnexe[term]

            nbElement[grandConnexe] += nbElement[petitConnexe]
            //parcours des connexes 
            for(let i=0;i<numConnexe.length;i++){
                if(numConnexe[i] == petitConnexe){
                    numConnexe[i] = grandConnexe
                }
            }
            console.log(arrete)

            console.log(numConnexe,nbElement)
            if(nbElement[grandConnexe] == this.listeSommets.length-1)break;
        }

        return new Graphe(
            this.oriente,
            this.nbSommets,
            adjacentArbre.length,
            this.nbValeursParArc,
            //copie profonde
            this.listeSommets.map(el=>({...el})),
            adjacentArbre.map(el=>el.map(el=>({...el}))))
    }
}

module.exports = Graphe