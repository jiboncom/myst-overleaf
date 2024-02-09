import React from 'react';


// Core Myst Parser
import { VFile } from 'vfile';
import { mystParse  } from 'myst-parser';

// Frontmatter rendering
import { validatePageFrontmatter } from 'myst-frontmatter';
import { FrontmatterBlock } from '@myst-theme/frontmatter';

// Transformations
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import {
    mathPlugin,
    footnotesPlugin,
    keysPlugin,
    basicTransformationsPlugin,
    enumerateTargetsPlugin,
    resolveReferencesPlugin,
    WikiTransformer,
    GithubTransformer,
    DOITransformer,
    RRIDTransformer,
    linksPlugin,
    ReferenceState,
    getFrontmatter,
    glossaryPlugin,
    abbreviationPlugin,
    joinGatesPlugin
  } from 'myst-transforms';

// Article renders
import { ReferencesProvider, ThemeProvider, Theme } from '@myst-theme/providers';

import { MyST, DEFAULT_RENDERERS } from 'myst-to-react';


// Styling to the default Myst look (Borrowed from the Myst Sandbox)
import './MystPreview.css';

// Create a new component called MystPreview that takes a value prop and keeps it in state.
function MystPreview(props) {
  const [astNodes, setAstNodes] = React.useState(props.value);
  const [value2, setValue2] = React.useState();
  const [frontmatter, setFrontmatter] = React.useState();
  const [references_output, setReferences] = React.useState();

  
  const MYST_THEME = Theme.light;   
  const linkTransforms = [
    new WikiTransformer(),
    new GithubTransformer(),
    new DOITransformer(),
    new RRIDTransformer(),
  ];

  // This function is called whenever the value prop changes.
  React.useEffect(() => {

    const file = new VFile();
    const mdast = mystParse(props.value, {
        markdownit: { linkify: true },
        directives: [],
        // roles: [reactiveRole],
        vfile: file,
    });

    const references = {
        cite: { order: [], data: {} },
    };
    const { frontmatter: frontmatterRaw } = getFrontmatter(file, mdast, {
        removeYaml: true,
        removeHeading: false,
    });
    const frontmatter = validatePageFrontmatter(frontmatterRaw, {
        property: 'frontmatter',
        messages: {},
    });

    const state = new ReferenceState({
        numbering: frontmatter.numbering ?? FrontmatterBlock?.numbering,
        file,
    });

    unified()
        .use(basicTransformationsPlugin)
        .use(mathPlugin, { macros: frontmatter?.math ?? {} }) // This must happen before enumeration, as it can add labels
        .use(glossaryPlugin, { state }) // This should be before the enumerate plugins
        .use(abbreviationPlugin, { abbreviations: frontmatter.abbreviations })
        .use(enumerateTargetsPlugin, { state })
        .use(linksPlugin, { transformers: linkTransforms })
        .use(footnotesPlugin)
        .use(joinGatesPlugin)
        .use(resolveReferencesPlugin, { state })
        .use(keysPlugin)
        .runSync(mdast, file);

    console.log(mdast)
    console.log(visit)
    visit(mdast, (n) => delete n.position);

    //setValue(props.value);
    setAstNodes(mdast);
    setFrontmatter(frontmatter)
    setReferences({ ...references, article: mdast })

  }, [props.value]);

  // Return a div with dangerouslySetInnerHTML set to the value.
  return (
    <div className='MystPreview'>
        <ThemeProvider renderers={DEFAULT_RENDERERS} theme={MYST_THEME}>
            <ReferencesProvider references={references_output}>
                <FrontmatterBlock frontmatter={frontmatter} className='frontmatter'></FrontmatterBlock>
                <br />
                <MyST ast={astNodes} />
            </ReferencesProvider>
        </ThemeProvider>
    </div>
  );
}

export default MystPreview;