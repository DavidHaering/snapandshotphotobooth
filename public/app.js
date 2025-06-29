let autocomplete;
let service;
const adresseMaison = "Rue Pierre de Savoie 9, 1680 Romont, Suisse";

function initAutocomplete() {
  const adresseInput = document.getElementById('adresseEvent');
  autocomplete = new google.maps.places.Autocomplete(adresseInput, {
    componentRestrictions: { country: "ch" }, // limite à Suisse
    fields: ["formatted_address", "geometry"],
    types: ["address"],
  });

  service = new google.maps.DistanceMatrixService();

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    const distanceInput = document.getElementById('nbrekilometre');

    if (!place.geometry) {
      // Adresse non valide
      distanceInput.value = "Adresse non trouvée";
      return;
    }

    calculerDistance(place.formatted_address);
  });
}

function calculerDistance(adresseClient) {
  const distanceInput = document.getElementById('nbrekilometre');

  service.getDistanceMatrix(
    {
      origins: [adresseMaison],
      destinations: [adresseClient],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    },
    (response, status) => {
      if (status !== "OK") {
        distanceInput.value = 'Erreur : ' + status;
        return;
      }

      const element = response.rows[0].elements[0];
      if (element.status === "OK") {
        // Récupérer la distance en mètres, convertir en km et arrondir
        const distanceMetres = element.distance.value;
        const distanceKm = Math.round(distanceMetres / 1000);
        distanceInput.value = distanceKm; // uniquement le nombre arrondi

        // ⚡ Appeler les fonctions pour mettre à jour les totaux
        if (typeof updateAll === "function") updateAll();
        if (typeof updateTotalDevis === "function") updateTotalDevis();

      } else {
        distanceInput.value = "Impossible de calculer la distance.";
      }
    }
  );
}

// Pour que initAutocomplete soit appelé automatiquement par Google Maps API
window.initAutocomplete = initAutocomplete;