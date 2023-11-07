import esbuild from 'esbuild';

const lambdas = [
    'register',
    'login',
    'createLink',
    'getLinkFromShortUrl',
    'deactivateLink',
];

lambdas.forEach(lambda => {
    esbuild.build({
        entryPoints: [`src/lambdas/${lambda}.ts`],
        bundle: true,
        minify: true,
        platform: 'node',
        target: ['node18'],
        outfile: `dist/${lambda}.js`,
        sourcemap: true,
        external: ['mock-aws-s3', 'nock'],
        loader: {
            '.html': 'text',
        },
    }).catch(() => process.exit(1));
});