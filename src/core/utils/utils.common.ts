export function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}


export const generateIncreament = (lastIncrement: string | undefined) => {
  try {
    let newIncrement = "000001";

    if (lastIncrement) {
      const match = lastIncrement.match(/^CUS-\d{7}-[A-Z]{2}(\d{6})$/);
      if (match && match[1]) {
        const lastIncrement = parseInt(match[1], 11);
        newIncrement = String(lastIncrement + 1).padStart(6, "0");
      }
    }
    return newIncrement;
  } catch (error) {
    console.error("Error fetching last student user:", error);
    return undefined;
  }
};


// export function (name) {
//   if (!this.code) {
//     const baseCode = this.name.slice(0, 4).toUpperCase(); // first 4 letters
//     const count = await Category.countDocuments({ name: new RegExp(`^${this.name}`, 'i') });
//     this.code = `${baseCode}${count + 1}`; // ELEC1, ELEC2, etc.
//   }
//   next();
// };
