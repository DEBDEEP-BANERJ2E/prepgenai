

export function MenuItem ({onClick , text , red}){
    return(
        <div
        onClick={onClick} className={`
        w-full text-left px-5 py-3 text-sm
        transition-colors rounded-lg cursor-pointer
        ${
          red
            ? "text-red-400 hover:bg-red-500/10"
            : "text-gray-200 hover:bg-white/10"
        }
      `}>
        {text}

        </div>
    )
}