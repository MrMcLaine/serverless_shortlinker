import esbuild from 'esbuild';

const lambdas = [
    'register',
    'login',
    'createLink',
    'authorizer',
    'getLinksByUser',
    'getLinkFromShortUrl',
    'deactivateLink',
    'cronJob',
    'handleLinkExpiration'
];

lambdas.forEach(lambda => {
    esbuild.build({
        entryPoints: [`src/lambdas/${lambda}.ts`],
        bundle: true,
        minify: true,
        platform: 'node',
        target: ['node18'],
        outfile: `dist/${lambda}.js`,
        sourcemap: false, 
        format: 'cjs',
        external: ['aws-sdk'],
        loader: {
            '.html': 'text',
        },
    }).catch(() => process.exit(1));
});