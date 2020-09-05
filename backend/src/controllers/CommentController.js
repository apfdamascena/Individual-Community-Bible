const connection = require("../database/connection");
const { destroy } = require("../database/connection");

module.exports = {
    async index(request, response) {
        const { abbrev, number } = request.params;
        const { pages = 1 } = request.query;

        const chapter = await connection('chapters')
            .where("book_abbrev", abbrev)
            .andWhere("number", number)
            .first()
            .select("id")

        if (chapter) {
            const comments = await connection('comments')
                .where("chapter_id", chapter.id)
                // .limit(5)
                // .offset((pages - 1) * 5)
                .select("*");
            
            return response.json( comments );
        } else {
            return response.json({ "error": "chapter not found" })
        }    
    },

    async show(request, response) {
        const { abbrev, number, verse } = request.params;

        const chapter = await connection('chapters')
            .where("book_abbrev", abbrev)
            .andWhere("number", number)
            .first()
            .select("id")

        const comments = await connection('comments')
            .where("chapter_id", chapter.id)
            .andWhere("verse", verse)
            .select("*");

        if (comments) {
            return response.json(comments)
        } else {
            return response.json({ "error": "chapter number doesn't exists" })
        }
    },

    async store(request, response) {
        const { abbrev, number, verse } = request.params;
        const { token, text, tags, on_title } = request.body;
        
        if (!token | !text | !tags | on_title == null) {
            return response.json(
                { "error": "insufficient body: token, text, tags, on_title" }
            )
        }
 
        const chapter = await connection('chapters')
        .where("book_abbrev", abbrev)
        .andWhere("number", number)
        .first()
        .select("id")
        
        if (chapter) {
            
            var name = "Visitante";
            const user = await connection('users')
                .where("token", token)
                .first()
            
            if (user) {
                name = user.name;
                
                const new_chapter_commented = JSON.parse(
                    user.chapters_commented)
                if (abbrev in new_chapter_commented) {
                    if (!(number in new_chapter_commented[abbrev])) {
                        new_chapter_commented[abbrev].push(number)
                    }
                } else {
                    new_chapter_commented[abbrev] = [number]
                }

                await connection('users')
                    .where("token", token)
                    .first()
                    .increment("total_comments", 1)
                    .update({
                        "chapters_commented": JSON.stringify(
                            new_chapter_commented)
                    })
            }
            
            const comment = await connection('comments')
                .insert({
                    name,
                    text,
                    on_title,
                    verse,
                    tags: JSON.stringify(tags),
                    chapter_id: chapter.id
                })
            
            return response.json({ 
                id: comment[0],
                name,
                text,
                on_title,
                verse: parseInt(verse),
                tags
            });
        } else {
            return response.json({ "error": "Chapter doesn't exists" })
        }
    },

    async destroy(request, response) {
        const { id } = request.params;

        const comment = await connection("comments")
            .where("id", id)
            .delete()
        
        if (comment) {
            return response.json(comment)
        } else {
            return response.json({ "message": "Id not found" })
        }
    }
}