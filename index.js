
$( "#tabviews" ).tabs();

var tree = {},
	cloud = {},
	terms = [];

function createTree(children) {
	var result = [];
	children.forEach(element => {
		var item = {};
		item.text = element.title;

		if (element.children) {
			item.children = createTree(element.children);
		} else {
			item.url = element.url;
			item.icon = "jstree-file";

			item.text.split(/\W/).forEach(term => {
				var tag = term.toLowerCase();
				if (tag !== '') {
					cloud[tag] = cloud[tag] || 0;
					cloud[tag] += 1;
				}				
			});
		}
		result.push(item);
	});
	return result;
};

function createLinks(term) {
	$("#searchResults").children().remove();
	chrome.bookmarks.search(term, function(results) {
		results.forEach(node => {
			if (node.url) {
				$("#searchResults").append(`<a target=_blank href='${node.url}'>${node.title}</a><br>`);
			}
		})
	})
}

chrome.bookmarks.getTree((nodes) => {
	var tree = {};
	tree.core = {};
	tree.core.data = createTree(nodes[0].children);
	$('#treeTab').jstree(tree);

	Object.keys(cloud).sort().forEach(term => {
		terms.push(term);
		var val = cloud[term];
		if (val > 10) val = 10;
		$("#cloudTab").append("<a href='#' rel='" + val + "'>" + term + "</a> ");
	});
	$("#cloudTab a").tagcloud({
		size: {start: 8, end: 48, unit: "pt"},
		color: {start: '#c5c5c5', end: '#007fff'}
	}).click(function() {
		var term = $(this).text();
		$("#searchTerms").val(term);
		createLinks(term);
		$("#tabviews").tabs({ active: 2 });	
	});

	$("#searchTerms").autocomplete({
		source: terms
	});
	
	$( "#searchButton" ).button({
		icon: "ui-icon-search",
		showLabel: false
	}).click(function() {
		var term = $("#searchTerms").val();
		createLinks(term);
	});
});
