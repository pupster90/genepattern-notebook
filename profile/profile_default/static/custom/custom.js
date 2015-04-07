/*
 * Create the GenePattern object to hold GP state
 */
var GenePattern = {
    authenticated: false,
    initialized: false,
    password: null,
    server: null,
    tasks: [],
    username: null
};

/*
 * Navigation widgets
 */

function loadingScreenNav() {
    return $("<div></div>")
        .addClass("loading-screen")
        .append(
            $("<img/>")
                .attr("src", "/static/custom/GP_logo_on_black.png")
        );
}

function bottomButtonNav() {
    var auth_view = GenePattern.authenticated ? "visible" : "hidden";
    return $("<div></div>")
            .addClass("container add-cell-container")
            .append(
                $("<span></span>")
                    .addClass("fa fa-paragraph add-cell-button")
                    .attr("title", "Add Markdown Cell")
                    .attr("data-toggle", "tooltip")
                    .attr("data-placement", "top")
                    .click(function() {
                        var index = IPython.notebook.get_cells().length;
                        IPython.notebook.insert_cell_below('markdown', index);
                        IPython.notebook.select_next();
                    })
            )
            .append(
                $("<span></span>")
                    .addClass("fa fa-terminal add-cell-button")
                    .attr("title", "Add Code Cell")
                    .attr("data-toggle", "tooltip")
                    .attr("data-placement", "top")
                    .click(function() {
                        var index = IPython.notebook.get_cells().length;
                        IPython.notebook.insert_cell_below('code', index);
                        IPython.notebook.select_next();
                    })
            )
            .append(
                $("<span></span>")
                    .addClass("glyphicon glyphicon-th add-cell-button gp-cell-button")
                    .attr("title", "Add GenePattern Cell")
                    .css("padding-left", "3px")
                    .css("visibility", auth_view)
                    .attr("data-toggle", "tooltip")
                    .attr("data-placement", "top")
                    .click(function() {
                        $(".sidebar-button-main").trigger("click");
                    })
            );
}

function sliderTabNav() {
    var auth_view = GenePattern.authenticated ? "inline-block" : "none";
    return $("<span></span>")
            .addClass("glyphicon glyphicon-ok sidebar-button sidebar-button-main")
            .attr("title", "GenePattern Options")
            .attr("data-toggle", "tooltip")
            .attr("data-placement", "right")
            .css("display", auth_view)
            .click(function() {
                $("#slider").show("slide");
            });
}

function sliderOptionNav(id, name, anno, desc) {
    return $("<div></div>")
        .addClass("slider-option")
        .attr("name", id)
        .append(
            $("<span></span>")
                .addClass("slider-option-name")
                .append(name)
        )
        .append(
            $("<span></span>")
                .addClass("slider-option-anno")
                .append(anno)
        )
        .append(
            $("<span></span>")
                .addClass("slider-option-desc")
                .append(desc)
        );
}

function sliderNav() {
    return $("<div></div>")
        .attr("id", "slider")

        // Append the navigation tab
        .append(
            $("<span></span>")
                .addClass("glyphicon glyphicon-ok sidebar-button sidebar-button-slider")
                .attr("title", "GenePattern Options")
                .attr("data-toggle", "tooltip")
                .attr("data-placement", "right")
                .click(function() {
                    $("#slider").hide("slide");
                })
        )

        // Append the filter box
        .append(
            $("<div></div>")
                .attr("id", "slider-filter-box")
                .append(
                    $("<input/>")
                        .attr("id", "slider-filter")
                        .attr("type", "search")
                        .attr("placeholder", "Type to Filter")
                )
        )

        // Append the internal tabs
        .append(
            $("<div></div>")
                .attr("id", "slider-tabs")
                .addClass("tabbable")
                .append(
                    $("<ul></ul>")
                        .addClass("nav nav-tabs")
                        .append(
                            $("<li></li>")
                                .addClass("active")
                                .append(
                                    $("<a></a>")
                                        .attr("data-toggle", "tab")
                                        .attr("href", "#slider-modules")
                                        .text("Modules")
                                )
                        )
                        .append(
                            $("<li></li>")
                                .append(
                                    $("<a></a>")
                                        .attr("data-toggle", "tab")
                                        .attr("href", "#slider-data")
                                        .text("Data")
                                )
                        )
                        .append(
                            $("<li></li>")
                                .append(
                                    $("<a></a>")
                                        .attr("data-toggle", "tab")
                                        .attr("href", "#slider-jobs")
                                        .text("Jobs")
                                )
                        )
                )
                .append(
                    $("<div></div>")
                        .addClass("tab-content")
                        .append(
                            $("<div></div>")
                                .attr("id", "slider-modules")
                                .addClass("tab-pane active")
                        )
                        .append(
                            $("<div></div>")
                                .attr("id", "slider-data")
                                .addClass("tab-pane")
                        )
                        .append(
                            $("<div></div>")
                                .attr("id", "slider-jobs")
                                .addClass("tab-pane")
                        )
                )
        );
}

function authenticateNav(data) {
    // Show the GenePattern cell button
    $(".gp-cell-button").css("visibility", "visible");

    // Show the slider tab
    $(".sidebar-button-main").show("slide", {"direction": "left"});

    // Clear and add the modules to the slider
    $("#slider-modules").empty();
    if (data['all_modules']) {
        $.each(data['all_modules'], function(index, module) {
            $("#slider-modules").append(sliderOptionNav(module['lsid'], module['name'], "v" + module['version'], module['description']));
        });
        $("#slider-modules").append($("<p>&nbsp;</p>"))
    }

    console.log(data);
}

/*
 * Initialization functions
 */

// Declare and attach the initialization functions
function main_init_wrapper(evt) {
    launch_init(evt);

    // Mark init as done
    launch_init.done_init = true;
}
function notebook_init_wrapper(evt) {
    if (!launch_init.done_init  && IPython.notebook.kernel) {
        launch_init(evt);

        // Mark init as done
        launch_init.done_init = true;
    }
}
function launch_init() {
    // Change the logo
    $("#ipython_notebook").find("img").attr("src", "/static/custom/GP_logo_on_black.png");

    // Add the bottom buttons
    $("#notebook-container").append(bottomButtonNav());

    // Add the sidebar
    var body = $("body");
    body.append(sliderTabNav());
    body.append(sliderNav());

    // Initialize tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });

    // Auto-run widgets
    $(function () {
        $.each($(".cell"), function(index, val) {
            if ($(val).html().indexOf("# !AUTOEXEC") > -1) {
                IPython.notebook.get_cell(index).execute();
            }
        });
    });

    // Hide the loading screen
    setTimeout(function () {
        $(".loading-screen").toggle("fade");
    }, 100);
}

/*
 * Initialize the page
 */

// Add the loading screen
$("body").append(loadingScreenNav());

// If in a notebook, display with the full event model
$([IPython.events]).on('kernel_ready.Kernel kernel_created.Session notebook_loaded.Notebook', notebook_init_wrapper);

// If the notebook listing page, display with alternate event model
if ($(document).find("#notebooks").length > 0) {
    setTimeout(main_init_wrapper, 1000);
}

/**
 * Define the IPython GenePattern Authentication widget
 */
require(["widgets/js/widget"], function (WidgetManager) {

    var AuthWidgetView = IPython.WidgetView.extend({
        render: function () {
            var widget = this;
            // Render the view.
            this.setElement(
                $("<div></div>")
                    .addClass("panel panel-primary gp-widget gp-widget-auth")
                    .append(
                        $("<div></div>")
                            .addClass("panel-heading")
                            .append(
                                $("<div></div>")
                                    .addClass("widget-float-right")
                                    .append(
                                        $("<span></span>")
                                            .addClass("widget-server-label")
                                            .append(widget.getServerLabel(""))
                                    )
                                    .append(
                                        $("<button></button>")
                                            .addClass("btn btn-default btn-sm widget-slide-indicator")
                                            .css("padding", "2px 7px")
                                            .attr("title", "Expand or Collapse")
                                            .attr("data-toggle", "tooltip")
                                            .attr("data-placement", "bottom")
                                            .append(
                                                $("<span></span>")
                                                    .addClass("fa fa-arrow-up")
                                            )
                                            .tooltip()
                                            .click(function() {
                                                widget.expandCollapse();
                                            })
                                    )
                                    .append(" ")
                                    .append(
                                        $("<button></button>")
                                            .addClass("btn btn-default btn-sm")
                                            .css("padding", "2px 7px")
                                            .attr("title", "Toggle Code View")
                                            .attr("data-toggle", "tooltip")
                                            .attr("data-placement", "bottom")
                                            .append(
                                                $("<span></span>")
                                                    .addClass("fa fa-terminal")
                                            )
                                            .tooltip()
                                            .click(function() {
                                                widget.toggleCode();
                                            })
                                    )
                            )
                            .append(
                                $("<h3></h3>")
                                    .addClass("panel-title")
                                    .append(
                                        $("<span></span>")
                                            .addClass("glyphicon glyphicon-th")
                                    )
                                    .append(" GenePattern: ")
                                    .append(
                                        $("<span></span>")
                                            .addClass("widget-username-label")
                                            .append(widget.getUserLabel("Login"))
                                    )
                            )
                        )
                    .append(
                        $("<div></div>")
                            .addClass("panel-body widget-code")
                            .css("display", "none")
                    )
                    .append(
                        $("<div></div>")
                            .addClass("panel-body widget-view")
                            .append(
                                $("<div></div>")
                                    .addClass("form-group")
                                    .append(
                                        $("<label></label>")
                                            .attr("for", "server")
                                            .text("GenePattern Server")
                                    )
                                    .append(
                                        $("<select></select>")
                                            .addClass("form-control")
                                            .attr("name", "server")
                                            .attr("type", "text")
                                            .css("margin-left", "0")
                                            .append(
                                                $("<option></option>")
                                                    .attr("value", "http://genepattern.broadinstitute.org/gp")
                                                    .text("GenePattern @ Broad Institute")
                                            )
                                            .append(
                                                $("<option></option>")
                                                    .attr("value", "http://127.0.0.1:8080/gp")
                                                    .text("GenePattern @ localhost")
                                            )
                                            .val(widget.getServerLabel("http://genepattern.broadinstitute.org/gp"))
                                    )
                            )
                            .append(
                                $("<div></div>")
                                    .addClass("form-group")
                                    .append(
                                        $("<label></label>")
                                            .attr("for", "username")
                                            .text("GenePattern Username")
                                    )
                                    .append(
                                        $("<input/>")
                                            .addClass("form-control")
                                            .attr("name", "username")
                                            .attr("type", "text")
                                            .attr("placeholder", "Username")
                                            .attr("required", "required")
                                            .val(widget.getUserLabel(""))
                                    )
                            )
                            .append(
                                $("<div></div>")
                                    .addClass("form-group")
                                    .append(
                                        $("<label></label>")
                                            .attr("for", "password")
                                            .text("GenePattern Password")
                                    )
                                    .append(
                                        $("<input/>")
                                            .addClass("form-control")
                                            .attr("name", "password")
                                            .attr("type", "password")
                                            .attr("placeholder", "Password")
                                            .val(widget.getPasswordLabel(""))
                                    )
                            )
                            .append(
                                $("<button></button>")
                                    .addClass("btn btn-primary gp-auth-button")
                                    .text("Login to GenePattern")
                                    .click(function() {
                                        var server = widget.$el.find("[name=server]").val();
                                        var username = widget.$el.find("[name=username]").val();
                                        var password = widget.$el.find("[name=password]").val();

                                        widget.buildCode(server, username, password);
                                        widget.authenticate(server, username, password, function() {
                                            widget.executeCell();
                                            widget.buildCode(server, "", "")
                                        });
                                    })
                            )
                    )
            );

            // Hide the code by default
            var element = this.$el;
            setTimeout(function() {
                element.closest(".cell").find(".input")
                    .css("height", "0")
                    .css("overflow", "hidden");
            }, 1);

            // Hide the login form if already authenticated
            if (GenePattern.authenticated) {
                setTimeout(function() {
                    element.find(".panel-body").hide();
                    var indicator = element.find(".widget-slide-indicator").find("span");
                    indicator.removeClass("fa-arrow-up");
                    indicator.addClass("fa-arrow-down");
                }, 1);
            }
        },

        expandCollapse: function() {
            var toSlide = this.$el.find(".panel-body.widget-view");
            var indicator = this.$el.find(".widget-slide-indicator").find("span");
            if (toSlide.is(":hidden")) {
                toSlide.slideDown();
                indicator.removeClass("fa-arrow-down");
                indicator.addClass("fa-arrow-up");
                this.$el.find(".widget-code").slideUp();
            }
            else {
                toSlide.slideUp();
                indicator.removeClass("fa-arrow-up");
                indicator.addClass("fa-arrow-down");
            }
        },

        toggleCode: function() {
            var code = this.$el.find(".widget-code");
            var view = this.$el.find(".widget-view");

            if (code.is(":hidden")) {
                this.options.cell.code_mirror.refresh();
                var raw = this.$el.closest(".cell").find(".input").html();
                code.html(raw);

                // Fix the issue where the code couldn't be selected
                code.find(".CodeMirror-scroll").attr("draggable", "false");

                view.slideUp();
                code.slideDown();
            }
            else {
                view.slideDown();
                code.slideUp();
            }
        },

        buildCode: function(server, username, password) {
            var code = '# !AUTOEXEC\n\
\n\
import gp\n\
from gp_widgets import GPAuthWidget\n\
\n\
# The gpserver object holds your authentication credentials and is used to\n\
# make calls to the GenePattern server through the GenePattern Python library.\n\
# Your actual username and password have been removed from the code shown\n\
# below for security reasons.\n\
gpserver = gp.GPServer("' + server + '", "' + username + '", "' + password + '")\n\
\n\
# Return the authentication widget to view it\n\
GPAuthWidget(gpserver)';

            this.options.cell.code_mirror.setValue(code);
        },

        executeCell: function() {
            this.options.cell.execute();
        },

        authenticate: function(server, username, password, done) {
            var widget = this;
            $.ajax({
                type: "GET",
                url: server + "/rest/v1/tasks/all.json",
                dataType: 'json',
                cache: false,
                xhrFields: {
                    withCredentials: true
                },
                //beforeSend: function (xhr) {
                //    xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                //},
                success: function(data, status, xhr) {
                    // Set the authentication info on GenePattern object
                    GenePattern.authenticated = true;
                    GenePattern.server = server;
                    GenePattern.username = username;
                    GenePattern.password = password;

                    // Make authenticated UI changes to auth widget
                    widget.$el.find(".widget-username-label").text(username);
                    widget.$el.find(".widget-server-label").text(server);

                    // Enable authenticated nav elsewhere in notebook
                    authenticateNav(data);

                    // If a function to execute when done has been passed in, execute it
                    if (done) { done(); }
                },
                error: function(xhr, status, e) {
                    console.log("Error authenticating");
                }
            });
        },

        getUserLabel: function(alt) {
            if (GenePattern.authenticated && GenePattern.username) {
                return GenePattern.username;
            }
            else {
                return alt
            }
        },

        getPasswordLabel: function(alt) {
            if (GenePattern.authenticated && GenePattern.password) {
                return GenePattern.password;
            }
            else {
                return alt
            }
        },

        getServerLabel: function(alt) {
            if (GenePattern.authenticated && GenePattern.server) {
                return GenePattern.server;
            }
            else {
                return alt
            }
        }
    });

    // Register the JobWidgetView with the widget manager.
    IPython.WidgetManager.register_widget_view('AuthWidgetView', AuthWidgetView);
});

/**
 * Define the IPython GenePattern Job widget
 */
require(["widgets/js/widget"], function (WidgetManager) {

    var JobWidgetView = IPython.WidgetView.extend({
        render: function () {
            // Render the view.
            this.setElement($('<div/></div>'));
            var json = this.model.get('json');
            this.$el.jobResults({
                json: json
            });
        },

        events: {
            // List of events and their handlers.
            'click': 'handle_click'
        },

        handle_click: function (evt) {
            console.log("Clicked!");
        }
    });

    // Register the JobWidgetView with the widget manager.
    IPython.WidgetManager.register_widget_view('JobWidgetView', JobWidgetView);
});