(function(ei, $) {

    /**
     * Creates an graph in a given empty div
     * Usage: see /test/elroi.js for an example usage (this is commented out currently due to WebTestJS erroring out)
     * @param args An object containing
     *          $el - jQ DOM element to insert the graph into
     *          data - An array of series objects containing series data, and series options
     *          options - options for the graph
     * @return graph The graph object
     * @return {function} draw Method to draw the graph
     * @return {function} update Updates the graph with new data
     */
    function elroi(args) {
        var defaults = {
            colors: ['#99cc33', '#ffee44', '#ffbb11', '#ee5500', '#33bbcc', '#88ddee'],
            labelDateFormat: 'M',
            errorMessage : false,
            labelWidth : 'auto',
            flagOffset : 5,
            skipPointThreshhold : 18,
            grid : {
                show: true,
                showBaseline: true,
                numYLabels : 5
            },
            axes : {
                x1 : {
                    customXLabel: false,
                    id : 'x1',
                    type: 'date',
                    show : true,
                    labels : [],
                    seriesIndex : 0    // By default, the axis values are derived from the first series of data
                },
                x2 : {
                    customXLabel: false,
                    id : 'x2',
                    type : 'text',
                    show : false,
                    labels : [],
                    seriesIndex : 0
                },
                y1 : {
                    id : 'y1',
                    show : true,
                    unit: '',
                    topUnit: '',
                    prefixUnit: false,
                    seriesIndex : 0
                },
                y2 : {
                    id : 'y2',
                    show : false,
                    unit: '',
                    topUnit: '',
                    prefixUnit: false,
                    seriesIndex: 0
                }
            },
            tooltip: {
                formatter : function(){},
                show: true,
                width: 120
            },
            seriesDefaults: {
                type: 'line',
                showPoints: true,
                fillPoints: false,
                labelPoints: false,
                interpolateNulls : false,
                maxYValue : 'auto',
                minYValue : 0,
                unit: '',
                pointLabelUnits: ''
            },
            bars : {
                highlightBorderWidth : 2,
                highlightBorderOpacity : 0.8,
                highlightColor : '#ccc',
                flagPosition: 'exterior' // exterior or interior - the label appears above or inside the bar
            },
            lines : {
                width : 2,
                opacity : 0.8,
                fillOpacity : 0.2,
                pointRadius : 3,
                pointStrokeWidth : 2,
                highlightStrokeWidth : 4,
                highlightRadius : 6,
                highlightOpacity : 0.8
            },
            padding: {top:15, right:20, bottom:18, left:50}
        };

        var $el = $(args.$el)
                    .addClass('graph'),  //CR: change to .elroi because .graph is too easy to use for other things
            $paper = $('<div></div>')
                        .addClass('paper')
                        .appendTo($el),
            options = $.extend(true, {}, defaults, args.options);

        var width = $paper.width() || $el.width(),
            height = $paper.height() || $el.height();

        var graph = ei.elroi.init({
            padding : options.padding,
            labelLineHeight: 12,
            width: width,
            height: height,
            allSeries: args.data,
            $el: $el,
            paper: Raphael($paper.get(0), width, height),
            argGraphOpts: options,
            options: options,
            tooltips: args.tooltips
        });

        // Set up the tooltip div
        var html = '<div class="graph-tooltip"><div class="tooltip-content rounded bgFadeWhite"></div></div>';
        graph.$tooltip = $(html);

        graph.$tooltip.width(graph.options.tooltip.width).appendTo($el.find('.paper')).addClass('png-fix');
        // Hide the tooltip when a user moves their mouse off the graph
        $el.mouseleave(function() {
            graph.$tooltip.css('left', -10000);
        });

        /**
         * Draws the graph grid, any error messaging, and any charts and graphs for all data
         */
        function draw() {

            var isGridDrawn = false;

            // Draw the error message, if the graph has one
            if(graph.options.errorMessage) {
                 var $errorMsg = $('<div id="graph-error">' + graph.options.errorMessage + '</div>')
                    .addClass('alert box');

                graph.$el.find('.paper').prepend($errorMsg);
            }

            // There is no data - draw the grid so the error message isn't floating solo
            if(!graph.allSeries.length) {
                ei.elroi.grid(graph).draw();
            }

            $(graph.allSeries).each(function(i) {

                if(!isGridDrawn && graph.seriesOptions[i].type != 'pie') {
                    ei.elroi.grid(graph).draw();
                    isGridDrawn = true;
                }

                // Draw those lines
                if (graph.seriesOptions[i].type == 'line') {
                    ei.elroi.lines(graph, graph.allSeries[i].series, i).draw();
                }
                // Bar time
                else if (graph.seriesOptions[i].type == 'stackedBar') {
                    ei.elroi.stackedBars(graph, graph.allSeries[i].series, i).draw();
                }
                // Make a pie
                else if (graph.seriesOptions[i].type == 'pie') {
                    ei.elroi.pie(graph, graph.allSeries[i].series, i).draw();
                }

            });

        }

        /**
         * Deletes all of the Raphael objects, and removes the axes from the graph
         */
        function clearGraph() {
            // Clear the canvas
            graph.paper.clear();

            // Kill the axes, point flags, point labels, etc
            graph.$el.find('ul').remove();
            graph.$el.find('.point-flag').remove();
            graph.$el.find('.point-label').remove();
        }

        /**
         * Redraws the graph with new data
         * @param newData A new data object to be graphed
         */
        function update(newData) {
            // TODO - this should probably completely re-initialize the graph, but this is only used in rateComparison right now, and works as is

           clearGraph();
           graph.allSeries = newData;

           draw();
        }

        return {
            graph: graph,
            draw: draw,
            update: update
        };
    }

    ei.elroi = function(args) { if (args) { return new elroi(args); } };
})(ei, jQuery);