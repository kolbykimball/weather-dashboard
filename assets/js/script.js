var city = "";

var searchCity = $("#citySearch");
var searchBtn = $("#search-button");
var clearBtn = $("#clear-history");
var currentCity = $("#currentCity");
var currentTemp = $("#temp");
var currentHumidity= $("#humidity");
var currentWind=$("#wind");
var currentUV= $("#uvIndex");

var searchedCity=[];

function find(c){
    for (var i=0; i<searchedCity.length; i++){
        if(c.toUpperCase()===searchedCity[i]){
            return -1;
        }
    }
    return 1;
}



var APIKey = "dc1a549f2980acea09337f333e83fee1"

function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}

function currentWeather(city){
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        console.log(response);
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        var date=new Date(response.dt*1000).toLocaleDateString();
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");

        var temp = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemp).html((temp).toFixed(2)+"&#8457");
        $(currentHumidty).html(response.main.humidity+"%");
        var windSpeed=response.wind.speed;
        var windmph=(windSpeed*2.237).toFixed(1);
        $(currentWind).html(windmph+"MPH");
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            searchedCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(searchedCity);
            if (searchedCity==null){
                searchedCity=[];
                searchedCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(searchedCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    searchedCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(searchedCity));
                    addToList(city);
                }
            }
        }

    });
}

function UVIndex(lon,lat){
    var uvURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lat+"&lon="+lon;
    $.ajax({
            url:uvURL,
            method:"GET"
            }).then(function(response){
                $(currentUV).html(response.value);
            });
}

function forecast(cityId){
    var forcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityId+"&appid="+APIKey;
    $.ajax({
        url:forcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconCode= response.list[((i+1)*8)-1].weather[0].icon;
            var iconUrl="https://openweathermap.org/img/wn/"+iconCode+".png";
            var tempK= response.list[((i+1)*8)-1].main.temp;
            var tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("#date"+i).html(date);
            $("#Img"+i).html("<img src="+iconUrl+">");
            $("#Temp"+i).html(tempF+"&#8457");
            $("#Humidity"+i).html(humidity+"%");
        }
        
    });
}

function appendHistory(c){
    var listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}
function PastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

function lastCity(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}
$("#search-button").on("click",displayWeather);
$(document).on("click",PastSearch);
$(window).on("load",lastCity);
$("#clear-history").on("click",clearHistory);
