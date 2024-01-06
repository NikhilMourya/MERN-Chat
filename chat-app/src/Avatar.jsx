export default function Avatar({userId,username}){
    const colors = ['bg-red-200','bg-yellow-200','bg-green-100','bg-purple-200','bg-blue-300','bg-brown-300','bg-teal-100']
    const userIdBase10 = parseInt(userId,16);
    const colorIndex = userIdBase10 % colors.length;
    // console.log(colorIndex,'colorindex');
    const color = colors[colorIndex];
    // console.log(colors[colorIndex])

    return(
        <div className={"w-8 h-8  rounded-full flex items-center justify-center uppercase " + color }>
            <div className="text-center opacity-70">{username[0]}</div>
        </div>
    )
}