class Vertex {
    constructor(id,nom, valeurs, degreExt = 0, degreInt = 0, degre = 0) {
        this.id = id;
        this.nom = nom;
        this.valeurs = valeurs;
        this.degreExt = degreExt;
        this.degreInt = degreInt;
        this.degre = degre;
    }
}

module.exports = Vertex



