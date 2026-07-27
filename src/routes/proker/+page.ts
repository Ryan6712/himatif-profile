export const load = async ({ fetch }) => {
    try {
        const res = await fetch("/dummy-data/proker.json")

        if(!res.ok) throw new Error(`error fetching ${res.status}`);

        const data = await res.json()

        return data
    } catch(error) {
        return console.log(error)
    }
}