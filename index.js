const Graphe = require('./graphe.js')

const graphe = new Graphe()
graphe.loadFile("./graphe-02.gra")
// // console.log(graphe.parcoursLargeur(1))
// // console.log(graphe.parcoursProfondeur(0))
// // console.log(graphe.parcoursProfondeur(1))
// // graphe.print()
// console.time("temps")
// console.log(graphe.dijkstra(7010))
// console.log(graphe.dijkstra(7010,3684))
// console.timeEnd("temps")


graphe.loadFile("./cours-representation.gra")
// console.log(graphe.parcoursLargeur(0))
// console.log(graphe.parcoursProfondeur(0))
// graphe.prim().print()
graphe.kruskal().print()

