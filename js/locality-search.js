var localitySearch = {};
localitySearch.storateObject = localStorage;
localitySearch.cityKey = 'municipios-busca';
localitySearch.stateKey = 'estados-busca';
localitySearch.ibgeApiUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades';

localitySearch.search = function(searchTerm) {
    if (!searchTerm) {
        return;
    }

    searchTerm = searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    searchTerm = searchTerm.toLowerCase();

    localitySearch.loadData();

    let cities = localitySearch.storateObject.getItem(localitySearch.cityKey);
    cities = JSON.parse(cities);

    let states = localitySearch.storateObject.getItem(localitySearch.stateKey);
    states = JSON.parse(states);

    if (!cities || !states) {
        return;
    }

    let results = [];

    Object.entries(cities).forEach(([key, item]) => {
        itemName = item.nome;
        item.nome = item.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

        if (item.nome.includes(searchTerm)) {
            results.push({
                'type': 'city',
                'name': itemName
            });
        }
    });

    Object.entries(states).forEach(([key, item]) => {
        itemName = item.nome;
        item.nome = item.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

        if (item.nome.includes(searchTerm)) {
            results.push({
                'type': 'state',
                'name': itemName,
                'uf': item.sigla
            });
        }
    });

    return results;
}

localitySearch.loadData = function() {
    if (localitySearch.storateObject.getItem(localitySearch.stateKey)
        && localitySearch.storateObject.getItem(localitySearch.cityKey)
    ) {
        return;
    }

    $.get(`${localitySearch.ibgeApiUrl}/municipios/`, function(data) {
        localitySearch.storateObject.setItem(localitySearch.cityKey, JSON.stringify(data));
        $(document).trigger('locality.search.city.loaded');
    });

    $.get(`${localitySearch.ibgeApiUrl}/estados`, function(data) {
        localitySearch.storateObject.setItem(localitySearch.stateKey, JSON.stringify(data));
        $(document).trigger('locality.search.state.loaded');
    });

    $(document).trigger('locality.search.loaded');
}
