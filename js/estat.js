function auth() {
    $.get("token.php", function(data) {
        gapi.analytics.auth.authorize({
            serverAuth: {
                access_token: data
            }
        });
    });
}


gapi.analytics.ready(function() {
    //autenticação
    auth();
    //variável revista
    let searchParams = new URLSearchParams(window.location.search);
    var revista = '';
    if (searchParams.has('revista')) {
        revista = searchParams.get('revista');
        $('#titulo').html('<h2>Acessos da revista ' + revista + '</h2>');
    } else {
        $('#titulo').html('<h2>Acessos do Portal</h2>');
    }
    var view = 140688252;
    //imprime o gráfico de linha de acessos
    var ac = print_access_chart(view, revista);
    d = print_date_selector();
    //imprime os graficos de rosca
    print_doughnut_chart(view, 'country', revista);
    print_doughnut_chart(view, 'source', revista);
    //imprime a tabela
    var t = print_table(view, revista);
    //registra o evento da mudança de data para atualizar os graficos
    d.on('change', function(data) {
        ac.set({
            query: data
        }).execute();
        t.set({
            query: data
        }).execute();
        print_doughnut_chart(view, 'country', revista, data);
        print_doughnut_chart(view, 'source', revista, data);
    });

});


function print_table(view, revista) {
    var filter="ga:pagePath=~/index.php/";
    if (revista==""){
	filter=filter+".*";
    }else{
	filter=filter+revista;
    }
    filter=filter+"/article/.*";
    var tab = new gapi.analytics.googleCharts.DataChart({
        query: {
            ids: "ga:" + view,
            'dimensions': 'ga:pagePath,ga:pageTitle',
            filters: filter,
            'metrics': 'ga:sessions,ga:users',
            'sort': '-ga:sessions',
            'max-results': '150',
            'start-date': '30daysAgo',
            'end-date': 'yesterday',
        },
        chart: {
            type: 'TABLE',
            container: 'tab-container',
            options: {
                width: '100%'
            }
        }
    });
    tab.execute();
    return tab;
}

function print_doughnut_chart(view, dimensao, revista, dateRange) {
    var base = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [],
                backgroundColor: ['#4D5360', '#949FB1', '#D4CCC5', '#E2EAE9', '#F7464A'],
                label: 'Dataset 1'
            }],
            labels: []
        },
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: 'Chart.js Doughnut Chart'
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };
    var config = jQuery.extend(true, {}, base);
    var filters = {
        'ids': 'ga:' + view,
        'dimensions': 'ga:' + dimensao,
        filters: 'ga:pagePath=@/index.php/' + revista,
        'metrics': 'ga:sessions',
        'sort': '-ga:sessions',
        'start-date': '30daysAgo',
        'end-date': 'yesterday',
        'max-results': 5
    };
    if (dateRange != null) {
        filters['start-date'] = dateRange['start-date'];
        filters['end-date'] = dateRange['end-date'];
    }
    query(filters).then(function(response) {


        var data = [];
        data.datasets = [];
        var colors = ['#4D5360', '#949FB1', '#D4CCC5', '#E2EAE9', '#F7464A'];

        response.rows.forEach(function(row, i) {
            config.data.labels[i] = row[0];
            config.data.datasets[0].data[i] = +row[1];
            config.data.datasets[0].backgroundColor[i] = colors[i];
        });
        var ctx = document.getElementById(dimensao + "-chart-area").getContext("2d");
        return new Chart(ctx, config);
    });
}


function query(params) {
    return new Promise(function(resolve, reject) {
        var data = new gapi.analytics.report.Data({
            query: params
        });
        data.once('success', function(response) {
                resolve(response);
            })
            .once('error', function(response) {
                reject(response);
            })
            .execute();
    });
}

function makeCanvas(id) {
    var container = document.getElementById(id);
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    container.innerHTML = '';
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);

    return ctx;
}

function generateLegend(id, items) {
    var legend = document.getElementById(id);
    legend.innerHTML = items.map(function(item) {
        var color = item.color || item.fillColor;
        var label = item.label;
        return '<li><i style=\"background:' + color + '\"></i>' +
            escapeHtml(label) + '</li>';
    }).join('');
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}



function print_date_selector() {
    var dateRange1 = {
        'start-date': '30daysAgo',
        'end-date': 'yesterday'
    };
    var dateRangeSelector1 = new gapi.analytics.ext.DateRangeSelector({
            container: 'date-range-selector-1-container'
        })
        .set(dateRange1)
        .execute();
    return dateRangeSelector1;
}

function print_access_chart(view, revista) {
    var dateRange1 = {
        'start-date': '30daysAgo',
        'end-date': 'yesterday'
    };

    var dataChart = new gapi.analytics.googleCharts.DataChart({
        query: {
            ids: "ga:" + view,
            metrics: 'ga:sessions,ga:users',
            dimensions: 'ga:date',
            filters: 'ga:pagePath=@/index.php/' + revista,
            'start-date': '30daysAgo',
            'end-date': 'yesterday',
        },
        chart: {
            container: 'chart-1-container',
            type: 'LINE',
            options: {
                width: '100%'
            }
        }
    });
    dataChart.execute();
    return dataChart;
}
