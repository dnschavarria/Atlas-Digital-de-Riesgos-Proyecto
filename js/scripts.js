// <!-- Funciones -->

function updateOpacity() {
	document.getElementById("span-opacity").innerHTML = document.getElementById("sld-opacity").value;
	Orosi8Layer.setOpacity(document.getElementById("sld-opacity").value);
}

function estilo_vias(feature) {
  var colorToUse;
  var line = feature.properties.descripcio;
            
  if (line === "Autopista") colorToUse = "#46C7FA";
  else if (line === "Camino") colorToUse = "#E81D1A";
  else if (line === "Puentes") colorToUse = "#4161BA";
  else if (line === "Red Nacional") colorToUse = "#599C65";
  else if (line === "Vereda") colorToUse = "#65018A";
  else colorToUse = "#000000";
            
  return {
    "color": colorToUse,
    "weight": 2
  };
}

function popup_vias (feature, layer) {
layer.bindPopup("Via:"+feature.properties.descripcio,
{minWidth: 150, maxWidth: 200});				
};

// <!-- Creación de un mapa de Leaflet -->
var map = L.map("mapid");

// <!-- Centro del mapa y nivel de acercamiento -->
var catedralSJ = L.latLng([9.823703, -83.804743]);
var zoomLevel = 15;

// <!-- Definición de la vista del mapa -->
map.setView(catedralSJ, zoomLevel);

// <!-- Adición de Capas Base -->

esriLayer = L.tileLayer.provider("Esri.WorldImagery").addTo(map);
osmLayer = L.tileLayer.provider("OpenStreetMap.Mapnik").addTo(map);

// <!-- Capa Raster -->

var Orosi8Layer = L.imageOverlay("VOrosi_88.jpg", 
	[[9.8211280799999994, -83.8081661549999950],
	[9.8261571960000005, -83.8014372600000002]],
	{opacity:0.5}
).addTo(map);

// <!-- Capas Base -->

var baseMaps = {
	"ESRI World Imagery": esriLayer,
	"OpenStreetMap": osmLayer
};

// <!-- Añadir Capa Raster -->

var overlayMaps = {
	"Ortofoto": Orosi8Layer
};

// <!-- Controles de mapa -->

var control_layers = L.control.layers(baseMaps, overlayMaps,{position:'topright', collapsed:false}).addTo(map);
L.control.scale({position:'topright', imperial:false}).addTo(map);
L.control.zoom({position:'topright'}).addTo(map);

L.control.scale().addTo(map);

// <!-- Capas GeoJSON -->

$.getJSON("edificaciones.geojson", function(geodata) {
	var layer_geojson_edif = L.geoJson(geodata, {
		style: function(feature) {
			return {'color': "#33c6ff", 'weight': 2, 'fillOpacity': 0.0}
		}			
	}).addTo(map);
	control_layers.addOverlay(layer_geojson_edif, 'Edificaciones');
});

$.getJSON("vias.geojson", function(geodata) {
	var layer_geojson_vias = L.geoJson(geodata, {
		style: estilo_vias,
		onEachFeature: popup_vias
	}).addTo(map);
	control_layers.addOverlay(layer_geojson_vias, 'Vias');
});

// <!-- Mapa Coropletico con Leaflet -->

$.getJSON("planosviviendas.geojson", function (geojson) {
	var layer_geojson_provincias = L.choropleth(geojson, {
		valueProperty: 'viviendas',
		scale: ['white', 'red'],
		steps: 5,
		mode: 'q',
		style: {
			color: '#fff',
			weight: 2,
			fillOpacity: 0.8
		},
		onEachFeature: function (feature, layer) {
			layer.bindPopup('UGM_COD: ' + feature.properties.UGM_COD + '<br>' + feature.properties.viviendas.toLocaleString() + ' viviendas')
		}
	}).addTo(map);
	control_layers.addOverlay(layer_geojson_provincias, 'Viviendas por UGM');	
	
	  // Add legend (don't forget to add the CSS from index.html)
  var legend = L.control({ position: 'bottomright' })
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend')
    var limits = layer_geojson_provincias.options.limits
    var colors = layer_geojson_provincias.options.colors
    var labels = []
	
	    // Add min & max
    div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
			<div class="max">' + limits[limits.length - 1] + '</div></div>'

    limits.forEach(function (limit, index) {
      labels.push('<li style="background-color: ' + colors[index] + '"></li>')
    })

    div.innerHTML += '<ul>' + labels.join('') + '</ul>'
    return div
  }
  legend.addTo(map)
	
});

// <!-- Filtrando datos geográficos en formato GeoJSON con Leaflet -->

var amenidades = L.layerGroup().addTo(map);

	function colorPuntos(d) { 
			return d == "Delegacion de policia" ? '#0045d8' : 
			d == "Hotel" ? '#04ff00' : 
			d == "Restaurante" ? '#00fbff' : 
			d == "Supermercado" ? '#e800ff' :
			d == "Tienda" ? '#ffd500' :
			'#000000'; 
		};
 
	function tipo_amenidades (feature) {
			return{
				radius: 7,
				fillColor: colorPuntos(feature.properties.tipo), 
			    color: colorPuntos(feature.properties.tipo), 
				weight: 1,
				opacity : 1,
				fillOpacity : 0.8
			};
		}; 


	function popup_amenidades (feature, layer) {
					layer.bindPopup("<div style=text-align:center><h3> Nombre: "+feature.properties.name,
			        {minWidth: 150, maxWidth: 200});				
					};

	var MarkerOptions = {
				    radius: 8,
				    fillColor: "#ff7800",
				    color: "#000",
				    weight: 1,
				    opacity: 1,
				    fillOpacity: 0.8
					};


	function myFunction() { 
	$.getJSON("amenidades.geojson", function(geodata) {
	var layer_geojson_amenidades = L.geoJson(geodata, {
		pointToLayer:function (feature, latlong){return L.circleMarker(latlong, MarkerOptions)},
		style: tipo_amenidades, 
		onEachFeature: popup_amenidades
		}).addTo(map);
	control_layers.addOverlay(layer_geojson_amenidades, 'Todos');
	amenidades.addLayer(layer_geojson_amenidades);
	});	
	
	}



	function estiloSelect() {
		var miSelect = document.getElementById("estilo").value;
				
		$.getJSON("amenidades.geojson", function(geodata) {
			var layer_geojson_amenidades = L.geoJson(geodata, {
							pointToLayer: function (feature, latlong) {
									return L.circleMarker(latlong, MarkerOptions);
								},
							filter: function(feature, layer) {						
								 if(miSelect != "TODOS")		
									 
									return (feature.properties.tipo == miSelect );
								else
									return true;
							},	
							style:tipo_amenidades,
							onEachFeature: popup_amenidades	
					});		
			amenidades.clearLayers();
			amenidades.addLayer(layer_geojson_amenidades);
 
		})
	};



