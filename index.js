import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";
const date = moment().format();

// const markCommit = (x, y) => {
//     const date = moment()
//     .subtract(1, "y")
//     .add(1, "d")
//     .add(x, "w")
//     .add(y, "d")
//     .format();
// }

const makeCommits = (n) => {
    if(n === 0) return simpleGit().push();
    
    // Randomly select a year (0-3 years back)
    const yearsBack = random.int(0, 3);
    const x = random.int(0, 54);
    const y = random.int(0, 6);
    
    // 30% chance of having a "very active" day (10-15 commits)
    // 70% chance of having a "normal" day (3-7 commits)
    const isVeryActiveDay = random.int(1, 100) <= 30;
    const commitsPerDay = isVeryActiveDay ? 
        random.int(10, 15) : // Very active day
        random.int(3, 7);    // Normal day
    
    const baseDate = moment()
        .subtract(yearsBack, "y")
        .add(1, "d")
        .add(x, "w")
        .add(y, "d");
    
    // Create multiple commits for the same day
    for(let i = 0; i < commitsPerDay; i++) {
        const date = baseDate
            .clone()
            .add(random.int(0, 23), "h")  // Random hour in the day
            .add(random.int(0, 59), "m")   // Random minute
            .format();
            
        jsonfile.writeFile(path, { 
            date: date,
            commit_number: i + 1,
            total_commits: commitsPerDay,
            type: isVeryActiveDay ? "high_activity" : "normal_activity"
        }, () => {
            simpleGit().add([path]).commit(
                `Update ${date} (${i + 1}/${commitsPerDay})`, 
                {"--date": date}, 
                i === commitsPerDay - 1 ? () => makeCommits(n - 1) : null
            );
        });
    }
}

const data = {
    date: date,
};
console.log(date);
jsonfile.writeFile(path, data);

// Increase the number of iterations for more commits
// This will create around 300-400 commits per year
makeCommits(1000);