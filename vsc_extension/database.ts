    loadFragmentsFromExternal(): void {
        // create new in-memory copy of on-disk databse
        const filebuffer = fs.readFileSync(this._fragmentFile);
        this._fragmentDatabase = new sql.Database(filebuffer);
        const res = this._fragmentDatabase.exec("SELECT * FROM fragments")[0];
        if (res === undefined) {
            return;
        }

        // reduce the array to all elements where snippet (element[9]) is null, meaning only fragments send from the chrome extension
        // also all fragments where snippet is "parametrize", meaning fragments sent frome chrome that should be parametrized
        const news = res.values.filter((element: any[]) => !element[9] || element[9] === "parametrize").forEach((element: any[]) => {
            const label = element[0];
            const prefix = element[1];
            const scope = element[2];
            var body = element[3];
            const description = element[4];
            const keywords = element[5];
            const tags = element[6];
            const domain = element[7];
            var placeholders = element[8];

            // parametrize this new fragment if its scope is python
            if (element[9] === "parametrize" && scope === 'python') {
                /*
                some function "parametrizeFuncion" needs to be written, that takes body as input and returns an array containing
                the parametrized body and the new placeholders string
                const result = parametrizeFunction(body);
                body = result[0];
                placeholders = result[1];
                */
                console.log(label);
            }

            const newFragment = new Fragment({
                label: label,
                prefix: prefix,
                scope: scope,
                body: body,
                description: description,
                keywords: keywords,
                tags: tags,
                domain: domain,
                placeholders: placeholders
            });
            // so that the newly created snippet is actually saved to the database
            this._fragmentDatabase.run("UPDATE fragments SET prefix=? , scope=?, body=?, description=?, keywords=?, tags=?, domain=?, placeholders=? , snippet=? WHERE label=?",
                [newFragment.prefix, newFragment.scope, newFragment.body, newFragment.description, newFragment.keywords, newFragment.tags, newFragment.domain, newFragment.placeholders, newFragment.snippet, newFragment.label]);
            this._loadedFragments.set(label, newFragment);
        });

        // save the changes from the in-memory copy to the disk
        // if there were any new fragments were the snippet attribute was changed
        if (news) {
            this.persist();
        }
    }