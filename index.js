const Graphe = require('./graphe.js')

const graphe = new Graphe()
graphe.loadFile("./cours-representation.gra")
console.log(graphe.parcoursLargeur(1))
console.log(graphe.parcoursProfondeur(0))
console.log(graphe.parcoursProfondeur(1))
