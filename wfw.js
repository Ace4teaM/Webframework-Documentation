
var doc = null;

$.extend({

    getQueryParameters: function (str) {
        return (str || document.location.search).replace(/(^\?)/, '').split("&").map(function (n) { return n = n.split("="), this[n[0]] = n[1], this }.bind({}))[0];
    }

});

$(document).ready(function () {

    $.ajax({
        type: "GET",
        url: "wfw.xml",
        dataType: "xml",
        success: function (xml) {
            doc = xml;

            // affichage de base
            ListLibrary();
            ListVersion();
            ListObjects();

            // Initialise la navigation
            InitTreeNavigation();

            // evenements
            $("#library").change(ListVersion);
            $("#version").change(function () {
                InitTreeNavigation();
                ListObjects();
            });
            $("#list_by").change(ListObjects);
            $("#object_list").change(function () {
                var id = $(this).val();
                ShowObject(id);
            });
            $("#GO").click(function () {
                ShowObject(GetSelectedObjectId());
            });

            // sélection depuis l'URL
            var queryParams = $.getQueryParameters();
            if (typeof queryParams == "undefined" || typeof queryParams["id"] == "undefined") {
                console.log("Affiche l'objet par défaut");
                ShowObject(GetSelectedObjectId());
            }
            else {
                console.log("Affiche l'objet :" + queryParams["id"]);
                console.log(queryParams);
                ShowObject(queryParams["id"]);
            }
        }
    });
});


/*
-------------------------------------------------------------------
Fonctions
-------------------------------------------------------------------
*/

// Initialise l'arbre de navigation
function SelectTreeNavigationObject(object_id) {
    $('#jstree').jstree("deselect_all");
    $('#jstree').jstree('select_node', 'tree_' + object_id);
}

// Initialise l'arbre de navigation
function InitTreeNavigation() {
    // initialise la liste des librairies
    var lib = GetSelectedLibrary();
    var menu;

    var funcAddObj = function () {
        // informations sur l'objet
        var link = "?" + $.param({ id: $(this).attr('id') });
        var desc = $(this).find('param[name="brief"]').first().html();
        var name = $(this).find('param[name="name"]').first().html();

        menu.append("<li id='tree_" + $(this).attr('id') + "'><a href='" + link + "'>" + name + "</a></li>");
    };

    // liste les procedures SQL
    $('#tree_ref_sql_proc>*').empty();
    menu = $("<ul></ul>");
    $(lib).find('object[type="procedure"]').each(funcAddObj);
    //$('>li', menu).attr("data-jstree", '{"type":"file"}');
    $('#tree_ref_sql_proc').append(menu);

    // liste les fonctions PHP
    $('#tree_ref_php_func>*').empty();
    menu = $("<ul></ul>");
    $(lib).find('object[type="function"]').each(funcAddObj);
    $('#tree_ref_php_func').append(menu);

    // liste les classes PHP
    $('#tree_ref_php_class>*').empty();
    menu = $("<ul></ul>");
    $(lib).find('object[type="class"]').each(funcAddObj);
    $('#tree_ref_php_class').append(menu);

    // liste les actions de templates
    $('#tree_ref_xml>*').empty();
    menu = $("<ul></ul>");
    $(lib).find('object[type="template_action"]').each(funcAddObj);
    $('#tree_ref_xml').append(menu);

    // liste les controleurs
    $('#tree_ref_controler>*').empty();
    menu = $("<ul></ul>");
    $(lib).find('object[type="controler"]').each(funcAddObj);
    $('#tree_ref_controler').append(menu);
    
    // Articles
    $('#tree_guide_cfg>*').empty();
    menu = $("<ul></ul>");
    $(lib).find('object[type="article"]').each(funcAddObj);
    $('#tree_guide_cfg').append(menu);

    // initialise l'arborescence
    $('#jstree').jstree();

    $("#jstree").on("activate_node.jstree", function (e, data) {
        var elementID = data.node.id;
        //var elementID = data.selected[0];
        console.log(data);
        // si l'objet est deja sélectionné
        if (elementID == 'tree_' + GetSelectedObjectId())
            return;
        // redirige la page
        var link = $("#" + elementID + " a").first().attr("href");
        if (link && link != "#")
            document.location = link;
    });
}


// Obtient la section relative à l'objet spécifié
function GetRelatedSection(object, lib) {
    var filename = $(object).attr("filename");
    // initialise la liste des librairies
    var section = null;
    $(lib).find('object[type="section"]').each(function () {
        if ($(this).attr("filename") == $(object).attr("filename")) {
            var thisPos = parseInt($(this).attr("position"));
            var sectionPos = parseInt($(section).attr("position"));
            var objectPos = parseInt($(object).attr("position"));

            if (section != null && (thisPos > sectionPos) && (thisPos < objectPos))
                section = this;
            else if (section == null && thisPos < objectPos)
                section = this;
        }
    });
    return section;
}

// Liste les librairies
function ListLibrary() {
    // initialise la liste des librairies
    $("#library").empty();
    $(doc).find('lib').each(function () {
        var title = jQuery.trim($(this).attr("title"));
        $("#library").append('<option value="' + title + '">' + title + '</option>');
    });
}

// Liste les versions
function ListVersion() {
    var library = jQuery.trim($("#library").val());
    // initialise la liste des versions de la librairie en cours
    $("#version").empty();
    $(doc).find('lib[title="' + library + '"]').each(function () {
        var version = jQuery.trim($(this).attr("version"));
        $("#version").append('<option value="' + version + '">' + version + '</option>');
    });
}

// Liste les objets
function ListObjects() {
    var library = $("#library").val();
    var version = $("#version").val();
    var type = $("#list_by").val();
    $("#object_list").empty();
    // Parse the xml file and get data
    $(doc).find('lib[title="' + library + '"][version="' + version + '"]>object[type="' + type + '"]').each(function () {
        var name = jQuery.trim($(this).find('>param[name="name"]').text());
        // initialise la liste des objets
        $("#object_list").append("<option value=\"" + $(this).attr("id") + "\">" + name + "</option>");
    });
}

// Liste les versions
function GetSelectedLibrary() {
    var library = jQuery.trim($("#library").val());
    var version = jQuery.trim($("#version").val());
    // initialise la liste des versions de la librairie en cours
    return $(doc).find('lib[title="' + library + '"][version="' + version + '"]').first();
}

// Obtient l'identifiant de l'objet sélectionné
function GetSelectedObjectId() {
    return $("#object_list").val();
}

// initialise un template du document avec les données d'un objet
function ShowArticle(filename) {
    // cache les templates
    $("#templates>*").hide();

    // charge le contenu du fichier
    $.get("./articles/" + filename, function (data) {
        var template = $('#article');

        alert(data);
        //process text file line by line
        $('#article').html(data.replace('n', '<br />'));

        // Affiche le template
        template.show();
    });
}

// initialise un template du document avec les données d'un objet
function MakeObjectTemplate(object, selector) {
    // initialise les textes du template
    $(selector).empty().each(function () {
        // initialise la liste des objets
        var element = $(this);
        var param_name = $(this).attr("name");
        var param_text = $(object).find('param[name="' + param_name + '"]');
        if (param_text.length == 1)
            element.text($(param_text).first().text());
        else if (param_text.length > 1) {
            var list = $("<ul></ul>");
            $(param_text).each(function () {
                list.append("<li>" + $(this).html() + "</li>");
            });
            element.append(list);
        }
    });
}

// Affiche le template de l'objet
function ShowObject(id) {
    console.log("ShowObject " + id);

    // cache les templates
    $("#templates>*").hide();

    // obtient l'objet
    var object = $(doc).find('object[id="' + id + '"]').first();
    if (object.length == 0)
        return;

    // obtient la librairie
    var lib = $(object).parent();

    //
    var library = $(lib).attr("title");
    var version = $(lib).attr("version");
    var name = $(object).find('>param[name="name"]').first().text();
    var type = $(object).attr("type");
    var template = $('#' + type);

    $("#library").val(library);
    $("#version").val(version);
    $("#list_by").val(type);
    $("#object_list").val(id);

    // informations sur l'objet
    $("#filename").text(object.attr("filename"));

    // initialise les textes du template
    MakeObjectTemplate(object, '#' + type + ' *[name]');

    // finalise l'initialisation du template
    var MakeTemplateFunc = "MakeTemplate_" + type;
    if (typeof (window[MakeTemplateFunc]) == "function") {
        eval(MakeTemplateFunc)(lib, object, name);
    }

    // affiche les infos de la page
    $('#infos').empty();
    var object = $(lib).find('object[type="infos"]').filter(function () {
        // verifie le fichier
        if ($(this).attr("filename") != object.attr("filename"))
            return;

        // Insert le texte
        var htmlText = $(this).find('param[name=""]').html();
        var content = $("<pre></pre>");
        content.append("<h3>" + $(this).find('param[name="title"]').html() + "</h3>");
        content.append(htmlText);

        /* Insert le texte
        var converter = new Showdown.converter();
        var htmlText = converter.makeHtml($(this).find('param[name=""]').text());
        var reg = new RegExp("(\<\/?h)([1-9]+)(\>)", "gi");
        htmlText = htmlText.replace(reg, function (match, p1, p2, p3, offset, string) {
            console.log("found " + p1 + p2 + p3);
            return p1 + (parseInt(p2) + 1) + p3;
        });
        //var htmlText = $(this).find('param[name=""]').html();

        //var content = $("<pre></pre>");
        var content = $("<div></div>");
        content.append("<h3>" + $(this).find('param[name="title"]').html() + "</h3>");
        content.append(htmlText);*/

        $('#infos').append(content);
    });

    // Affiche le template
    template.show();

    // selectionne l'objet dans l'arbre de navigation
    SelectTreeNavigationObject(id);
}

/*
-------------------------------------------------------------------
Fabrication étendu des templates
-------------------------------------------------------------------
*/

function MakeTemplate_class(lib, object, name)
{
    // liste les méthodes associés
    {
        $('#class_methods').empty();
        var list = $('<ul class="class_method_list"></ul>');
        $(lib).find('object[type="method"]').each(function () {
            // verifie le nom du fichier
            if ($(this).attr("filename") != object.attr("filename"))
                return;
            // obtient la section relative à l'objet
            var section = GetRelatedSection(this, lib);
            if (section == null) {
                console.log("section not found for objet " + $(this).find('param[name="name"]').first().text());
                return;
            }
            if ($(section).find('param[name="class"]').text() != name) {
                console.log("section class name no match");
                return;
            }
            // ajoute à la liste des membres
            var link = "?" + $.param({ id: $(this).attr('id') });
            var desc = $(this).find('param[name="brief"]').first().html();
            list.append("<li id='" + $(this).attr("id") + "'><a href='" + link + "'>" + $(this).find('param[name="name"]').first().html() + "</a><span>" + desc + "</span></li>");
        });
        $('#class_methods').append(list);
    }

    // liste les membres associés
    {
        $('#class_members').empty();
        var list = $('<ul class="class_member_list"></ul>');
        $(lib).find('object[type="member"]').each(function () {
            // verifie le fichier
            if ($(this).attr("filename") != object.attr("filename"))
                return;
            // obtient la section relative à l'objet
            var section = GetRelatedSection(this, lib);
            if (section == null) {
                console.log("section not found for objet " + $(this).find('param[name="name"]').first().text());
                return;
            }
            if ($(section).find('param[name="class"]').text() != name)
                return;
            // ajoute a la liste des membres
            var link = "?" + $.param({ id: $(this).attr('id') });
            var desc = $(this).find('param[name="brief"]').first().html();
            list.append("<li id='" + $(this).attr("id") + "'><a href='" + link + "'>" + $(this).find('param[name="name"]').first().html() + "</a><span>" + desc + "</span></li>");
        });
        $('#class_members').append(list);
    }
}


function MakeTemplate_controler(lib, object, name) {
} 

function MakeTemplate_article(lib, object, name) {
    // convertie le contenu 'MarkDown' au format 'HTML'
    var convert = new Showdown.converter({ extensions: ['table'] }).makeHtml;
    var template = $('#article');
    var md_content = $(object).find('param[name="#"]').text();
    var html_content = convert("#"+name+"\n"+md_content);
    template.empty();
    template.append(html_content);
}