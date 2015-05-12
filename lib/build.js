var metalsmith = require('metalsmith'),
	tags = require('metalsmith-tags'),
	branch = require('metalsmith-branch'),
	ignore = require('metalsmith-ignore'),
	assets = require('metalsmith-assets'),
	prismic = require('metalsmith-prismic'),
	redirect = require('metalsmith-redirect'),
	metadata = require('metalsmith-metadata'),
	markdown = require('metalsmith-markdown'),
	templates = require('metalsmith-templates'),
	permalinks = require('metalsmith-permalinks'),
	collections = require('metalsmith-collections'),
	htmlMinifier = require('metalsmith-html-minifier'),
	writemetadata = require('metalsmith-writemetadata');

function build() {
	return metalsmith('./')
		.source("src/content")
		.destination(".tmp")

	.use(metadata({
		sr: 'json/sr.json',
		en: 'json/en.json'
	}))

	.metadata({
		imagePath: '/imgs/'
	})

	.use(redirect({
		'': '/sr/',
		'index.html': '/sr/'
	}))

	.use(ignore([
			// 'en/**/*',
			// 'sr/collections/apartment-single.md',
			// 'sr/collections/article-single.md',
			// 'sr/collections/building-single.md',
			// 'sr/collections/interesting-single.md',
			// 'sr/faq.md',
			// 'sr/garaze.md',
			// 'sr/index.md',
			// 'sr/kontakt.md',
			// 'sr/lokali-novi-sad.md',
			// 'sr/novi-sad.md',
			// 'sr/o-nama.md',
			// 'sr/portfolio.md',
			// 'sr/stanovi-novi-sad.md',
			// 'sr/vesti.md',
			// 'sr/zanimljivosti.md'
		]))
		// pull in content from Prismic
		.use(branch("sr/**/*.md")
			.use(prismic({
				"url": "https://vaer.prismic.io/api",
				"linkResolver": function(ctx, documentLink) {
					/* Based on document type of the document */
					if (documentLink.type == 'news') {
						return 'sr' + '/vesti/' + documentLink.slug;
					}
					if (documentLink.type == 'buildings') {
						return 'sr' + '/stanovi-novi-sad/' + documentLink.slug;
					}
					if (documentLink.type == 'apartment') {
						return 'sr' + '/stanovi-novi-sad/' + documentLink.id;
					}
					if (documentLink.type == 'zanimljivosti') {
						return 'sr' + '/zanimljivosti/' + documentLink.slug;
					}
				}
			}))
		)

	.use(branch("en/**/*.md")
		.use(prismic({
			"url": "https://vaer.prismic.io/api",
			"linkResolver": function(ctx, documentLink) {
				/* Based on document type of the document */
				if (documentLink.type == 'news') {
					return 'en' + '/news/' + documentLink.slug;
				}
				if (documentLink.type == 'buildings') {
					return 'en' + '/apartments/' + documentLink.slug;
				}
				if (documentLink.type == 'apartment') {
					return 'en' + '/apartments/' + documentLink.id;
				}
			}
		}))
	)

	// important: collections must be set before contents
	// or the templates won't have the variables and crash
	.use(collections({
		test: {
			pattern: "en/**/about-us.md",
		}
	}))

	.use(writemetadata({
		collections: {
			test: {
				output: {
					path: '../prismic/export.json',
					asObject: true,
					metadata: {
						"type": "list"
					}
				},
				ignorekeys: ['contents', 'next', 'previous']
			}
		}
	}))

	.use(markdown({
		highlight: function(code) {
			return require('highlight.js').highlightAuto(code).value;
		},
		langPrefix: 'hljs '
	}))

	// Permalinks
	.use(permalinks({
		pattern: ':lang/:dir/:link'
	}))

	.use(templates({
		engine: "jade",
		directory: "src/layouts"
	}))

	.use(htmlMinifier()) // Use the default options

	.use(assets({
		source: './src/static', // relative to the working directory
		destination: './' // relative to the build directory
	}))

	.build(function(err, files) {
		if (err) {
			console.log(err);
		}
	});
}

build();
