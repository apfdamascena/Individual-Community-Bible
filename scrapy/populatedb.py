import requests, time, json

with open("books.json", encoding = "utf-8") as file:
    books = json.load(file)

for abbrev in books:
    if abbrev == "gn":
        continue
    title, length = books[abbrev]
    print(f"\nSending {title}[{abbrev}] with {length} chapters = ", end = "")
    response = requests.post(
        "https://biblecomment-backend.herokuapp.com/books", 
        json = {
            "title": title,
            "abbrev": abbrev,
            "length": length
    })
    print(response.json())
    with open(f"chapters/{abbrev}.json", encoding = "utf-8") as chapter:
        verses = json.load(chapter)

        for number in verses:
            print(f"Populating {abbrev}:{number} = ", end = "")
            response = requests.post(
            f"https://biblecomment-backend.herokuapp.com/books/{abbrev}/chapters/{number}", 
                json = {
                   "verses": verses[number]
            })
            print(response.json())
            time.sleep(1)