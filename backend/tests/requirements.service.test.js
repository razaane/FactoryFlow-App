const { calculateRequirements } = require("../src/services/requirements.service");

describe("calculateRequirements (multi-produits)", () => {
  it("additionne les besoins par matière (exemple du brief)", () => {
    // 10 x produit A (2 kg de X par unité)
    // 5 x produit B (3 kg de X et 1 kg de Y par unité)
    const items = [
      {
        quantity: 10,
        composition: [{ material: "X", quantity: 2 }]
      },
      {
        quantity: 5,
        composition: [
          { material: "X", quantity: 3 },
          { material: "Y", quantity: 1 }
        ]
      }
    ];

    const result = calculateRequirements(items);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ material: "X", quantity: 35 });
    expect(result).toContainEqual({ material: "Y", quantity: 5 });
  });

  it("marche avec un seul produit", () => {
    const items = [
      {
        quantity: 3,
        composition: [{ material: "X", quantity: 4 }]
      }
    ];

    expect(calculateRequirements(items)).toEqual([
      { material: "X", quantity: 12 }
    ]);
  });

  it("refuse une liste de produits vide", () => {
    expect(() => calculateRequirements([])).toThrow(
      "L'ordre doit contenir au moins un produit"
    );
  });

  it("refuse une quantité invalide", () => {
    const items = [
      { quantity: 0, composition: [{ material: "X", quantity: 2 }] }
    ];

    expect(() => calculateRequirements(items)).toThrow();
  });
});